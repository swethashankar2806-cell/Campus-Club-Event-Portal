
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const AMOUNT = 10000; // ₹100 in paise

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "campous_club_db",
  waitForConnections: true,
  connectionLimit: 10
});

// Razorpay configuration
let razorpay = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Campus Club backend is running"
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      database: "connected"
    });
  } catch (error) {
    console.error("Database health error:", error.message);

    res.status(500).json({
      success: false,
      database: "disconnected"
    });
  }
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM events ORDER BY event_date"
    );

    res.json(rows);
  } catch (error) {
    console.error("Events error:", error.message);

    res.status(500).json({
      message: "Unable to fetch events"
    });
  }
});

// Create event registration
app.post("/api/registrations", async (req, res) => {
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
        message: "Please fill in all registration details"
      });
    }

    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits"
      });
    }

    const [result] = await db.execute(
      `INSERT INTO registrations
       (
         event_id,
         student_name,
         student_email,
         register_number,
         department,
         year_of_student,
         phone,
         payment_status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
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
      success: true,
      message: "Registration created successfully",
      registrationId: result.insertId
    });
  } catch (error) {
    console.error("Create registration error:", error.message);

    res.status(500).json({
      message: "Unable to create registration. Check database columns."
    });
  }
});

// Get registrations for a student
app.get("/api/registrations", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        message: "Student email is required"
      });
    }

    const [rows] = await db.execute(
      `SELECT *
       FROM registrations
       WHERE student_email = ?
       ORDER BY id DESC`,
      [email]
    );

    res.json(rows);
  } catch (error) {
    console.error("Registrations error:", error.message);

    res.status(500).json({
      message: "Unable to fetch registrations"
    });
  }
});

// Get all clubs
app.get("/api/clubs", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM clubs"
    );

    res.json(rows);
  } catch (error) {
    console.error("Clubs error:", error.message);

    res.status(500).json({
      message: "Unable to fetch clubs"
    });
  }
});

// Create Razorpay order
app.post("/api/payment/create-order", async (req, res) => {
  console.log("CREATE ORDER ROUTE REACHED");

  try {
    if (!razorpay) {
      return res.status(503).json({
        message: "Razorpay keys are missing. Check src/backend/.env"
      });
    }

    const registrationId = Number(req.body.registrationId);

    if (
      !Number.isInteger(registrationId) ||
      registrationId <= 0
    ) {
      return res.status(400).json({
        message: "Valid registration ID is required"
      });
    }

    const [rows] = await db.execute(
      `SELECT id, payment_status
       FROM registrations
       WHERE id = ?`,
      [registrationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Registration not found"
      });
    }

    if (rows[0].payment_status === "PAID") {
      return res.status(400).json({
        message: "This registration is already paid"
      });
    }

    const order = await razorpay.orders.create({
      amount: AMOUNT,
      currency: "INR",
      receipt: `registration_${registrationId}`
    });

    await db.execute(
      `UPDATE registrations
       SET payment_status = 'PENDING',
           razorpay_order_id = ?
       WHERE id = ?`,
      [order.id, registrationId]
    );

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      message: "Unable to create payment order"
    });
  }
});

// Verify Razorpay payment
app.post("/api/payment/verify", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        message: "Razorpay configuration is missing"
      });
    }

    const {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const id = Number(registrationId);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Required payment details are missing"
      });
    }

    const [rows] = await db.execute(
      `SELECT id, payment_status, razorpay_order_id
       FROM registrations
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Registration not found"
      });
    }

    if (rows[0].payment_status === "PAID") {
      return res.json({
        success: true,
        message: "Registration is already paid"
      });
    }

    if (rows[0].razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({
        message: "Order does not match this registration"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const supplied = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature"
      });
    }

    // Verify payment directly with Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== AMOUNT ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment is not captured or details do not match"
      });
    }

    await db.execute(
      `UPDATE registrations
       SET payment_status = 'PAID',
           razorpay_payment_id = ?
       WHERE id = ? AND razorpay_order_id = ?`,
      [
        razorpay_payment_id,
        id,
        razorpay_order_id
      ]
    );

    res.json({
      success: true,
      message: "Payment verified successfully"
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);

    res.status(500).json({
      message: "Unable to verify payment"
    });
  }
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Start backend
async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Campus Club backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
