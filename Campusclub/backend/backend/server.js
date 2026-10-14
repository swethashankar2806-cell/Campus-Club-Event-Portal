const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'campus_club_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    console.error('Fetch events error:', error.message);
    res.status(500).json({ message: 'Failed to fetch events.' });
  }
});

// Register for an event
app.post('/api/registrations', async (req, res) => {
  const {
    event_id,
    student_name,
    student_email,
    register_number,
    department,
    year_of_student,
    phone,
  } = req.body;

  if (
    !event_id ||
    !student_name?.trim() ||
    !student_email?.trim() ||
    !register_number?.trim() ||
    !department?.trim() ||
    !year_of_student?.trim() ||
    !phone?.trim()
  ) {
    return res.status(400).json({
      message: 'Please fill in all required event registration fields.',
    });
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({
      message: 'Please enter a valid 10-digit phone number.',
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO registrations
       (event_id, student_name, student_email, register_number,
        department, year_of_student, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        event_id,
        student_name.trim(),
        student_email.trim(),
        register_number.trim(),
        department.trim(),
        year_of_student.trim(),
        phone.trim(),
      ]
    );

    res.status(201).json({
      message: 'Event registration successful!',
      registrationId: result.insertId,
    });
  } catch (error) {
    console.error('Event registration error:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'You have already registered for this event.',
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'The selected event does not exist.',
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

// Get registrations for a student by email
app.get('/api/registrations', async (req, res) => {
  const email = req.query.email?.trim();

  if (!email) {
    return res.status(400).json({
      message: 'Student email is required.',
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT r.*, e.title, e.event_date, e.event_time,
              e.venue, e.organizer, e.description
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE LOWER(TRIM(r.student_email)) = LOWER(?)
       ORDER BY e.event_date ASC`,
      [email]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fetch registrations error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch registrations.',
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
    console.error('Fetch clubs error:', error.message);
    res.status(500).json({ message: 'Failed to fetch clubs.' });
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
    year_of_study,
    phone,
  } = req.body;

  if (
    !club_id ||
    !student_name?.trim() ||
    !student_email?.trim() ||
    !register_number?.trim() ||
    !department?.trim() ||
    !year_of_study?.trim() ||
    !phone?.trim()
  ) {
    return res.status(400).json({
      message: 'Please fill in all required club registration fields.',
    });
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({
      message: 'Please enter a valid 10-digit phone number.',
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Match your existing database column names
    const [result] = await connection.execute(
      `INSERT INTO club_members
       (club_id, student_name, student_email, REGISTER_NUMBER,
        department, year_of_student, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        club_id,
        student_name.trim(),
        student_email.trim(),
        register_number.trim(),
        department.trim(),
        year_of_study.trim(),
        phone.trim(),
      ]
    );

    // Update the number of members in the club
    const [clubResult] = await connection.execute(
      'UPDATE clubs SET members = members + 1 WHERE id = ?',
      [club_id]
    );

    if (clubResult.affectedRows === 0) {
      throw new Error('The selected club does not exist.');
    }

    await connection.commit();

    res.status(201).json({
      message: 'Successfully joined the club!',
      memberId: result.insertId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Club registration error:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'You have already joined this club with this email.',
      });
    }

    if (
      error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.message === 'The selected club does not exist.'
    ) {
      return res.status(400).json({
        message: 'The selected club does not exist.',
      });
    }

    res.status(500).json({
      message: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start server after checking database connection
async function startServer() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log('MySQL connected successfully!');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
  }
}

startServer();