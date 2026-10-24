import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Payment.css';

const REGISTRATION_FEE = 100;
const BACKEND_URL = 'http://localhost:5000';

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

  // Load Razorpay Checkout
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');

      script.src = 'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // Handle payment
  const handlePayment = async () => {
    setMessage('');
    setLoading(true);

    try {
      // Step 1: Load Razorpay Checkout
      const loaded = await loadRazorpay();

      if (!loaded) {
        setMessage(
          'Unable to load Razorpay. Please check your internet connection.'
        );
        return;
      }

      // Step 2: Create an order on the backend
      const orderResponse = await axios.post(
        `${BACKEND_URL}/create-order`
      );

      const { order, key_id } = orderResponse.data;

      // Step 3: Configure Razorpay Checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Campus Club',
        description: `Registration for ${eventName}`,
        order_id: order.id,

        prefill: {
          name: studentName || '',
          email: studentEmail || '',
          contact: phone || ''
        },

        notes: {
          registrationId: String(registrationId),
          eventName: eventName
        },

        theme: {
          color: '#5e257f'
        },

        // Step 4: Verify payment on the backend
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              `${BACKEND_URL}/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            if (verifyResponse.data.success) {
              setMessage(
                `Payment verified successfully! Payment ID: ${response.razorpay_payment_id}`
              );
            } else {
              setMessage(
                'Payment could not be verified. Please contact the coordinator.'
              );
            }
          } catch (error) {
            console.error('Payment verification error:', error);

            setMessage(
              'Payment verification failed. Please contact the coordinator.'
            );
          }
        },

        modal: {
          ondismiss: function () {
            setMessage('Payment window closed.');
          }
        }
      };

      // Step 5: Open the payment window
      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);

        setMessage(
          response.error.description || 'Payment failed. Please try again.'
        );
      });

      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);

      setMessage(
        error.response?.data?.message ||
        'Unable to start payment. Please check whether the backend is running.'
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
          Complete your event registration payment securely using Razorpay.
        </p>

        <div className="event-details">
          <p>
            <strong>Event:</strong> {eventName}
          </p>

          <p>
            <strong>Student:</strong> {studentName || 'Not provided'}
          </p>

          <p>
            <strong>Registration ID:</strong> {registrationId}
          </p>
        </div>

        <div className="payment-amount">
          <span>Registration Fee</span>
          <h2>₹{REGISTRATION_FEE.toFixed(2)}</h2>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay ₹100 Now'}
        </button>

        {message && (
          <p className="payment-message" role="status">
            {message}
          </p>
        )}

        <p className="payment-warning">
          Use Razorpay Test Mode while developing. A verified payment
          signature confirms the checkout response, but your application
          must also record the payment against the registration before
          marking the registration as paid.
        </p>
      </div>
    </div>
  );
}

export default Payments;