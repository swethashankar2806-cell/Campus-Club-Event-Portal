const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MySQL database
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "campus_club",
    waitForConnections: true,
    connectionLimit: 10
});

// Razorpay configuration
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Check whether the backend is running
app.get("/", (req, res) => {
    res.send("Campus Club Payment and Events Server is running!");
});

// Test MySQL connection
app.get("/api/db-test", async (req, res) => {
    try {
        const connection = await db.getConnection();

        connection.release();

        res.json({
            success: true,
            message: "MySQL connected successfully!"
        });
    } catch (error) {
        console.error("MySQL connection error:", error.message);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed. Check your .env settings."
        });
    }
});

// Fetch events from MySQL
app.get("/api/events", async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT id, title, description, event_date,
                    event_time, venue, organizer
             FROM events
             ORDER BY event_date ASC`
        );

        res.json(events);
    } catch (error) {
        console.error("Fetching events failed:", error.message);

        res.status(500).json({
            message: "Unable to fetch events from the database."
        });
    }
});

// Create Razorpay order for ₹100
app.post("/create-order", async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: 10000,
            currency: "INR",
            receipt: "campus_event_" + Date.now()
        });

        res.json({
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Order creation failed:", error.message);

        res.status(500).json({
            message: "Unable to create payment order."
        });
    }
});

// Verify Razorpay payment signature
app.post("/verify-payment", (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment details."
            });
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        const signatureBuffer = Buffer.from(
            generatedSignature,
            "hex"
        );

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            "hex"
        );

        if (
            signatureBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(
                signatureBuffer,
                receivedBuffer
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

        res.json({
            success: true,
            message: "Payment verified successfully."
        });
    } catch (error) {
        console.error("Verification error:", error.message);

        res.status(500).json({
            success: false,
            message: "Payment verification error."
        });
    }
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Campus Club server running at http://localhost:${PORT}`
    );
});