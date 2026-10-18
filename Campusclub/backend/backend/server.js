
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campous_club_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Home route
app.get('/', (req, res) => {
    res.send('Campus Club API is running!');
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const [events] = await pool.execute(
            'SELECT * FROM events ORDER BY event_date ASC'
        );

        res.json(events);
    } catch (error) {
        console.error('Get events error:', error.message);
        res.status(500).json({
            message: 'Failed to fetch events'
        });
    }
});

// Register for an event
app.post('/api/registrations', async (req, res) => {
    try {
        const {
            event_id,
            student_name,
            student_email,
            register_number,
            department,
            year_of_student,
            phone
        } = req.body;

        if (
            !event_id ||
            !student_name ||
            !student_email ||
            !register_number ||
            !department ||
            !year_of_student ||
            !phone
        ) {
            return res.status(400).json({
                message: 'Please fill in all registration fields'
            });
        }

        // Confirm that the event exists
        const [events] = await pool.execute(
            'SELECT id FROM events WHERE id = ?',
            [event_id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO registrations
             (event_id, student_name, student_email, register_number,
              department, year_of_student, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                event_id,
                student_name,
                student_email,
                register_number,
                department,
                year_of_student,
                phone
            ]
        );

        res.status(201).json({
            message: 'Event registration successful',
            registrationId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'You are already registered for this event'
            });
        }

        res.status(500).json({
            message: 'Failed to register for the event'
        });
    }
});

// Get registrations, optionally filtered by student email
app.get('/api/registrations', async (req, res) => {
    try {
        const { email } = req.query;

        let sql = `
            SELECT r.*, e.title AS event_title, e.event_date
            FROM registrations r
            LEFT JOIN events e ON r.event_id = e.id
        `;

        const params = [];

        if (email) {
            sql += ' WHERE r.student_email = ?';
            params.push(email);
        }

        sql += ' ORDER BY r.id DESC';

        const [registrations] = await pool.execute(sql, params);
        res.json(registrations);

    } catch (error) {
        console.error('Get registrations error:', error.message);
        res.status(500).json({
            message: 'Failed to fetch registrations'
        });
    }
});

// Get all clubs
app.get('/api/clubs', async (req, res) => {
    try {
        const [clubs] = await pool.execute(
            'SELECT * FROM clubs ORDER BY id ASC'
        );

        res.json(clubs);
    } catch (error) {
        console.error('Get clubs error:', error.message);
        res.status(500).json({
            message: 'Failed to fetch clubs'
        });
    }
});

// Join a club
app.post('/api/clubs/join', async (req, res) => {
    try {
        const {
            club_id,
            student_name,
            student_email,
            register_number,
            department,
            year_of_student,
            phone
        } = req.body;

        if (
            !club_id ||
            !student_name ||
            !student_email ||
            !register_number ||
            !department ||
            !year_of_student ||
            !phone
        ) {
            return res.status(400).json({
                message: 'Please fill in all club membership fields'
            });
        }

        const [clubs] = await pool.execute(
            'SELECT id FROM clubs WHERE id = ?',
            [club_id]
        );

        if (clubs.length === 0) {
            return res.status(404).json({
                message: 'Club not found'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO club_members
             (club_id, student_name, student_email, REGISTER_NUMBER,
              department, year_of_student, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                club_id,
                student_name,
                student_email,
                register_number,
                department,
                year_of_student,
                phone
            ]
        );

        await pool.execute(
            'UPDATE clubs SET members = members + 1 WHERE id = ?',
            [club_id]
        );

        res.status(201).json({
            message: 'Successfully joined the club',
            membershipId: result.insertId
        });

    } catch (error) {
        console.error('Join club error:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'You have already joined this club'
            });
        }

        res.status(500).json({
            message: 'Failed to join the club'
        });
    }
});

// Submit payment details
app.post('/api/payments', async (req, res) => {
    try {
        const { reg_id, amount, trans_ref } = req.body;

        if (
            !reg_id ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0 ||
            typeof trans_ref !== 'string' ||
            !trans_ref.trim()
        ) {
            return res.status(400).json({
                message: 'Please provide a valid registration ID, amount and transaction reference'
            });
        }

        // Confirm that this registration exists
        const [registrations] = await pool.execute(
            'SELECT id FROM registrations WHERE id = ?',
            [reg_id]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                message: 'Registration not found'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO payments
             (reg_id, amount, trans_ref, pay_status)
             VALUES (?, ?, ?, 'Pending Verification')`,
            [reg_id, Number(amount), trans_ref.trim()]
        );

        res.status(201).json({
            message: 'Payment details submitted successfully',
            paymentId: result.insertId,
            status: 'Pending Verification'
        });

    } catch (error) {
        console.error('Payment error:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Payment already submitted for this registration'
            });
        }

        res.status(500).json({
            message: 'Failed to save payment details'
        });
    }
});

// Start server after checking the database connection
async function startServer() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL connected successfully!');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Campus Club API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MySQL connection failed:', error.message);
    }
}

startServer();
