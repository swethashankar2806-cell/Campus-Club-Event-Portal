const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_club_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Home route
app.get('/', (req, res) => {
  res.send('Campus Club and Event Management API is running!');
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const [events] = await pool.query(
      'SELECT * FROM events ORDER BY event_date ASC'
    );
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error.message);
    res.status(500).json({ message: 'Unable to fetch events' });
  }
});

// Register for an event
app.post('/api/registrations', async (req, res) => {
  try {
    const { event_id, student_name, student_email } = req.body;

    if (!event_id || !student_name || !student_email) {
      return res.status(400).json({
        message: 'Event ID, student name and email are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO registrations
       (event_id, student_name, student_email)
       VALUES (?, ?, ?)`,
      [event_id, student_name, student_email]
    );

    res.status(201).json({
      message: 'Event registration successful!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Event registration error:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'You have already registered for this event'
      });
    }

    res.status(500).json({
      message: 'Event registration failed'
    });
  }
});

// Get registrations for a student
app.get('/api/registrations', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: 'Please provide a student email'
      });
    }

    const [registrations] = await pool.query(
      `SELECT r.*, e.title, e.event_date, e.event_time, e.venue
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.student_email = ?
       ORDER BY e.event_date ASC`,
      [email]
    );

    res.json(registrations);
  } catch (error) {
    console.error('Fetch registrations error:', error.message);
    res.status(500).json({
      message: 'Unable to fetch registrations'
    });
  }
});

// Get all clubs
app.get('/api/clubs', async (req, res) => {
  try {
    const [clubs] = await pool.query(
      'SELECT * FROM clubs ORDER BY id ASC'
    );

    res.json(clubs);
  } catch (error) {
    console.error('Fetch clubs error:', error.message);
    res.status(500).json({
      message: 'Unable to fetch clubs'
    });
  }
});

// Join a club
app.post('/api/clubs/join', async (req, res) => {
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
      message: 'Please fill in all required fields'
    });
  }

  if (!/^\d{10}$/.test(String(phone))) {
    return res.status(400).json({
      message: 'Phone number must contain exactly 10 digits'
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Save student club membership
    const [result] = await connection.query(
      `INSERT INTO club_members
       (
         club_id,
         student_name,
         student_email,
         register_number,
         department,
         year_of_student,
         phone
       )
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

    // Update club member count
    await connection.query(
      'UPDATE clubs SET members = members + 1 WHERE id = ?',
      [club_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Successfully joined the club!',
      membership_id: result.insertId
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Club registration error:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'You have already joined this club with this email'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'The selected club does not exist'
      });
    }

    res.status(500).json({
      message: 'Club registration failed',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start server after checking MySQL
const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
  }
}

startServer();
