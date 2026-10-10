
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Test the database connection
app.get('/', (req, res) => {
  res.send('Campus Club Backend is running!');
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const [events] = await pool.query(
      'SELECT * FROM events ORDER BY event_date ASC'
    );

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Register a student for an event
app.post('/api/registrations', async (req, res) => {
  const { event_id, student_name, student_email } = req.body;

  if (
    !Number.isInteger(Number(event_id)) ||
    !student_name?.trim() ||
    !student_email?.trim()
  ) {
    return res.status(400).json({
      message: 'Event, student name and email are required'
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO registrations
       (event_id, student_name, student_email)
       VALUES (?, ?, ?)`,
      [Number(event_id), student_name.trim(), student_email.trim()]
    );

    res.status(201).json({
      message: 'Registration successful!',
      registration_id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'You have already registered for this event'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'The selected event does not exist'
      });
    }

    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// View a student's registrations by email
app.get('/api/registrations', async (req, res) => {
  const email = req.query.email;

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      message: 'Student email is required'
    });
  }

  try {
    const [registrations] = await pool.execute(
      `SELECT r.id AS registration_id,
              r.student_name,
              r.student_email,
              r.registered_at,
              e.id AS event_id,
              e.title,
              e.event_date,
              e.event_time,
              e.venue,
              e.organizer,
              e.description
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.student_email = ?
       ORDER BY e.event_date ASC`,
      [email.trim()]
    );

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch registrations'
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
