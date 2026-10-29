
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==================== MYSQL CONNECTION ====================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST?.includes("aivencloud.com")
    ? { rejectUnauthorized: false }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});

// ==================== RAZORPAY CONFIGURATION ====================

let razorpay = null;

function initializeRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    console.error("Razorpay credentials are missing.");
    razorpay = null;
    return;
  }

  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  console.log("Razorpay initialized.");
  console.log("Key ID prefix:", keyId.slice(0, 12));
  console.log("Secret loaded:", Boolean(keySecret));
  console.log("Secret length:", keySecret.length);
}

// Initialize once at startup.
initializeRazorpay();

// ==================== HEALTH CHECK ====================

app.get("/", (req, res) => {
  res.json({ message: "Campus Club backend is running" });
});

app.get("/api/health", async (req, res) => {
  let databaseConnected = false;

  try {
    await db.query("SELECT 1");
    databaseConnected = true;
  } catch (error) {
    console.error("Health check error:", error.message);
  }

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "OK" : "ERROR",
    database: databaseConnected ? "connected" : "disconnected",
    razorpayConfigured: Boolean(razorpay),
  });
});

// ==================== EVENTS ====================

app.get("/api/events", async (req, res) => {
  try {
    const [events] = await db.query(
      "SELECT * FROM events ORDER BY event_date"
    );

    res.json(events);
  } catch (error) {
    console.error("Get events error:", error.message);
    res.status(500).json({ message: "Unable to fetch events" });
  }
});

// ==================== CLUBS ====================

app.get("/api/clubs", async (req, res) => {
  try {
    const [clubs] = await db.query("SELECT * FROM clubs");
    res.json(clubs);
  } catch (error) {
    console.error("Get clubs error:", error.message);
    res.status(500).json({ message: "Unable to fetch clubs" });
  }
});

// ==================== EVENT REGISTRATION ====================

app.post("/api/registrations", async (req, res) => {
  try {
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
      !student_name ||
      !student_email ||
      !register_number ||
      !department ||
      !year_of_student ||
      !phone
    ) {
      return res.status(400).json({
        message: "Please provide all registration details",
      });
    }

    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO registrations
       (event_id, student_name, student_email, register_number,
        department, year_of_student, phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        event_id,
        student_name,
        student_email,
        register_number,
        department,
        year_of_student,
        phone,
      ]
    );

    res.status(201).json({
      message: "Registration successful",
      registrationId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Unable to register for event",
    });
  }
});

app.get("/api/registrations", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Student email is required",
      });
    }

    const [rows] = await db.execute(
      `SELECT r.*, e.*
       FROM registrations r
       LEFT JOIN events e ON r.event_id = e.id
       WHERE r.student_email = ?
       ORDER BY r.registered_at DESC`,
      [email]
    );

    res.json(rows);
  } catch (error) {
    console.error("Fetch registrations error:", error);
    res.status(500).json({
      message: "Unable to fetch registrations",
    });
  }
});

// ==================== JOIN CLUB ====================

app.post("/api/clubs/join", async (req, res) => {
  try {
    const {
      club_id,
      student_name,
      student_email,
      department,
      year_of_student,
      register_number,
      phone,
    } = req.body;

    if (
      !club_id ||
      !student_name ||
      !student_email ||
      !department ||
      !year_of_student ||
      !register_number ||
      !phone
    ) {
      return res.status(400).json({
        message: "Please provide all club membership details",
      });
    }

    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    const [existing] = await db.execute(
      `SELECT id FROM club_members
       WHERE club_id = ? AND student_email = ?`,
      [club_id, student_email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "You have already joined this club",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO club_members
       (club_id, student_name, student_email, department,
        year_of_student, REGISTER_NUMBER, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        club_id,
        student_name,
        student_email,
        department,
        year_of_student,
        register_number,
        phone,
      ]
    );

    res.status(201).json({
      message: "Successfully joined club",
      membershipId: result.insertId,
    });
  } catch (error) {
    console.error("Join club error:", error);
    res.status(500).json({
      message: "Unable to join club",
    });
  }
});

// ==================== CREATE RAZORPAY ORDER ====================

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { registrationId } = req.body;

    console.log(
      "Create order requested for registration:",
      registrationId
    );

    if (!registrationId) {
      return res.status(400).json({
        message: "Registration ID is required",
      });
    }

    if (!razorpay) {
      console.error("Razorpay is not configured.");

      return res.status(500).json({
        message: "Payment service is not configured",
      });
    }

    const [rows] = await db.execute(
      `SELECT id, student_name, student_email, payment_status
       FROM registrations
       WHERE id = ?`,
      [registrationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    const registration = rows[0];

    if (registration.payment_status === "PAID") {
      return res.status(400).json({
        message: "This registration has already been paid",
      });
    }

    // Create a fresh order for this payment attempt.
    const order = await razorpay.orders.create({
      amount: 10000,
      currency: "INR",
      receipt: `reg_${registration.id}_${Date.now()}`,
      notes: {
        registrationId: String(registration.id),
        studentEmail: registration.student_email,
      },
    });

    await db.execute(
      `UPDATE registrations
       SET payment_status = 'PENDING',
           razorpay_order_id = ?
       WHERE id = ?`,
      [order.id, registration.id]
    );

    console.log("Razorpay order created:", order.id);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID.trim(),
      registrationId: registration.id,
      studentName: registration.student_name,
      studentEmail: registration.student_email,
    });
  } catch (error) {
    // Detailed diagnostics appear in the backend terminal.
    console.error("CREATE ORDER ERROR:", error);
    console.error(
      "RAZORPAY ERROR CODE:",
      error.error?.code || "Not provided"
    );
    console.error(
      "RAZORPAY ERROR DESCRIPTION:",
      error.error?.description || error.message || "Unknown error"
    );

    const description =
      error.error?.description || error.description || error.message || "";

    if (
      error.statusCode === 401 ||
      error.error?.description === "Authentication failed"
    ) {
      return res.status(502).json({
        message: "Razorpay authentication failed",
        error:
          "Check that the backend is using the matching Razorpay Key ID and Key Secret from the same mode.",
      });
    }

    res.status(500).json({
      message: "Unable to create payment order",
      error: description || "Unknown error",
    });
  }
});

// ==================== VERIFY PAYMENT ====================

app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !registrationId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment verification details",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!secret || !razorpay) {
      return res.status(500).json({
        message: "Payment verification is not configured",
      });
    }

    const [rows] = await db.execute(
      `SELECT id, payment_status, razorpay_order_id
       FROM registrations
       WHERE id = ?`,
      [registrationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    const registration = rows[0];

    if (registration.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({
        message: "Order does not match this registration",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const supplied = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(generatedSignature, "hex");

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Confirm the payment with Razorpay.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== 10000 ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        message: "Payment is not captured or details do not match",
      });
    }

    await db.execute(
      `UPDATE registrations
       SET payment_status = 'PAID',
           razorpay_payment_id = ?
       WHERE id = ?`,
      [razorpay_payment_id, registrationId]
    );

    console.log(
      "Payment verified for registration:",
      registrationId
    );

    res.json({
      success: true,
      message: "Payment verified successfully",
      registrationId,
    });
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

    res.status(500).json({
      message: "Unable to verify payment",
      error: error.message || "Unknown error",
    });
  }
});

// ==================== START SERVER ====================

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(`Campus Club backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
