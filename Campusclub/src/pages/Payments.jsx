import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/Payment.css';

// Replace these with your actual details
const UPI_ID = 'rithanya162@okicici';
const PAYEE_NAME = 'Campus Club';
const WHATSAPP_NUMBER = '91 9150114181';
const REGISTRATION_FEE = 100;

function Payments() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    registrationId,
    event,
    studentName,
    studentEmail,
    phone
  } = location.state || {};

  const [transRef, setTransRef] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!registrationId || !event) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h1>Registration Not Found</h1>
          <p>Please register for an event first.</p>
          <button onClick={() => navigate('/events')}>
            Go to Events
          </button>
        </div>
      </div>
    );
  }

  const eventName = event.title || event.name || 'Campus Event';

  // Generate UPI payment link
  const upiLink = `upi://pay?pa=${encodeURIComponent(
    UPI_ID
  )}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${REGISTRATION_FEE.toFixed(
    2
  )}&cu=INR&tn=${encodeURIComponent(eventName)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (
      UPI_ID === 'YOUR_REAL_UPI_ID' ||
      WHATSAPP_NUMBER === '91YOUR_COORDINATOR_NUMBER'
    ) {
      setMessage(
        'Please configure your actual UPI ID and coordinator WhatsApp number.'
      );
      return;
    }

    if (!transRef.trim()) {
      setMessage('Please enter your UPI transaction reference.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/payments',
        {
          reg_id: registrationId,
          amount: REGISTRATION_FEE,
          trans_ref: transRef.trim()
        }
      );

      const whatsappMessage =
        `Hello Campus Club Coordinator!\n\n` +
        `Event: ${eventName}\n` +
        `Registration ID: ${registrationId}\n` +
        `Student Name: ${studentName || ''}\n` +
        `Student Email: ${studentEmail || ''}\n` +
        `Phone: ${phone || ''}\n` +
        `Amount: Rs. ${REGISTRATION_FEE}\n` +
        `Transaction Reference: ${transRef.trim()}\n` +
        `Status: Pending Verification\n\n` +
        `Please verify my payment. Thank you!`;

      const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(whatsappMessage);

      setMessage(
        (response.data.message || 'Payment details submitted.') +
        ' Payment is pending verification.'
      );

      // Open WhatsApp in a new tab
      window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Payment submission error:', error);

      setMessage(
        error.response?.data?.message ||
        'Could not submit payment details. Check whether the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h1>Event Payment</h1>

        <p className="payment-subtitle">
          Scan the QR code using Google Pay, PhonePe, or another UPI app.
        </p>

        <div className="event-details">
          <p><strong>Event:</strong> {eventName}</p>
          <p><strong>Student:</strong> {studentName}</p>
          <p><strong>Registration ID:</strong> {registrationId}</p>
        </div>

        <div className="payment-amount">
          <span>Registration Fee</span>
          <h2>₹{REGISTRATION_FEE.toFixed(2)}</h2>
        </div>

        <div className="qr-container">
          <QRCodeSVG
            value={upiLink}
            size={220}
            level="H"
            includeMargin
          />
        </div>

        <p className="payment-hint">
          Scan the QR code and verify the recipient name and amount
          in your UPI app before confirming payment.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="transRef">
            UPI Transaction Reference
          </label>

          <input
            id="transRef"
            type="text"
            value={transRef}
            onChange={(e) => setTransRef(e.target.value)}
            placeholder="Enter transaction reference"
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Submitting...'
              : 'Submit Details & Open WhatsApp'}
          </button>
        </form>

        {message && (
          <p className="payment-message" role="status">
            {message}
          </p>
        )}

        <p className="payment-warning">
          Payment status remains pending until the coordinator
          verifies that the money was received. Submitting a
          transaction reference alone does not confirm payment.
        </p>
      </div>
    </div>
  );
}

export default Payments;