
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Payment.css";

const API_URL = import.meta.env.VITE_API_URL;

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Payments() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    registrationId,
    eventName = "Campus Club Event",
    studentName = "",
    studentEmail = "",
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const amountInRupees = 100;

  const handlePayment = async () => {
    if (!API_URL) {
      setMessage("Backend URL is missing. Please configure VITE_API_URL.");
      return;
    }

    if (!registrationId) {
      setMessage(
        "Registration ID is missing. Please register for the event again."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      // Create an order on the backend.
      const orderResponse = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { registrationId }
      );

      const order = orderResponse.data;

      if (!order.orderId || !order.keyId) {
        throw new Error("The backend did not return valid payment details.");
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Campus Club",
        description: `Registration fee - ${eventName}`,
        order_id: order.orderId,

        prefill: {
          name: studentName,
          email: studentEmail,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          try {
            setMessage("Verifying your payment...");

            const verifyResponse = await axios.post(
              `${API_URL}/api/payment/verify`,
              {
                registrationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (
              verifyResponse.data.success === true ||
              verifyResponse.data.verified === true
            ) {
              setPaymentSuccess(true);
              setMessage(
                "Payment successful! Your registration is confirmed."
              );
            } else {
              setMessage(
                "Payment verification was not confirmed. Please contact the event team."
              );
            }
          } catch (error) {
            setMessage(
              error.response?.data?.message ||
                "Payment verification failed. Please contact the event team before trying again."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage("Payment was cancelled. You can try again.");
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", function (response) {
        setLoading(false);
        setMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      checkout.open();
    } catch (error) {
      setLoading(false);
      setMessage(
        error.response?.data?.message ||
          "Unable to start payment. Please check whether the backend is running."
      );
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Event Payment</h2>

        <p>
          Complete your event registration payment securely using Razorpay.
        </p>

        <div className="payment-details">
          <p>
            <strong>Event:</strong> {eventName}
          </p>

          <p>
            <strong>Student:</strong> {studentName || "Student"}
          </p>

          <p>
            <strong>Registration ID:</strong>{" "}
            {registrationId || "Not available"}
          </p>

          <div className="payment-amount">
            <span>Registration Fee</span>
            <strong>₹{amountInRupees.toFixed(2)}</strong>
          </div>
        </div>

        {message && (
          <p
            className={
              paymentSuccess ? "payment-message success" : "payment-message"
            }
            role="status"
          >
            {message}
          </p>
        )}

        {paymentSuccess ? (
          <button
            className="payment-button"
            onClick={() => navigate("/my-events")}
          >
            Go to My Events
          </button>
        ) : (
          <button
            className="payment-button"
            onClick={handlePayment}
            disabled={loading || !registrationId}
          >
            {loading ? "Processing..." : "Pay ₹100 Now"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Payments;
