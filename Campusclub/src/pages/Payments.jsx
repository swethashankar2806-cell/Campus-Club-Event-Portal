
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Payment.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");

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

export default function Payments() {
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
  const validRegistrationId =
    Number.isInteger(Number(registrationId)) &&
    Number(registrationId) > 0;

  const handlePayment = async () => {
    if (!validRegistrationId) {
      setMessage("Registration ID is missing. Please register again.");
      return;
    }

    setLoading(true);
    setMessage("Connecting to payment service...");

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const orderResponse = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { registrationId: Number(registrationId) },
        { timeout: 30000 }
      );

      const order = orderResponse.data;

      if (!order.orderId || !order.keyId || !order.amount) {
        throw new Error("Incomplete payment order details.");
      }

      setMessage("");

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
          color: "#5940ed",
        },

        handler: async (response) => {
          setMessage("Payment received. Verifying payment...");

          try {
            const verifyResponse = await axios.post(
              `${API_URL}/api/payment/verify`,
              {
                registrationId: Number(registrationId),
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { timeout: 30000 }
            );

            if (verifyResponse.data.success) {
              setPaymentSuccess(true);
              setMessage("Payment verified successfully!");
            } else {
              setMessage(
                verifyResponse.data.message ||
                  "Payment could not be verified."
              );
            }
          } catch (error) {
            setMessage(
              error.response?.data?.message ||
                "Unable to verify payment. Please check your payment status."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Checkout closed. You can try again.");
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        setMessage(
          response.error?.description || "Payment failed. Please try again."
        );
      });

      checkout.open();
    } catch (error) {
      setLoading(false);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Unable to connect to the payment service."
      );
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Event Payment</h2>
        <p>Pay securely using Razorpay Checkout.</p>

        <div className="payment-details">
          <p>
            <strong>Event:</strong> {eventName}
          </p>

          <p>
            <strong>Student:</strong> {studentName || "Student"}
          </p>

          <p>
            <strong>Registration ID:</strong>{" "}
            {validRegistrationId ? registrationId : "Missing"}
          </p>

          <div className="payment-amount">
            <span>Registration Fee</span>
            <strong>₹{amountInRupees.toFixed(2)}</strong>
          </div>
        </div>

        {message && (
          <p
            className={
              paymentSuccess
                ? "payment-message success"
                : "payment-message"
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
            disabled={loading || !validRegistrationId}
          >
            {loading ? "Processing..." : "Pay ₹100 Now"}
          </button>
        )}
      </div>
    </div>
  );
}
