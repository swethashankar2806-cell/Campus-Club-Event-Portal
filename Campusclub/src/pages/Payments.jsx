
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Payment.css";

const API_URL = "https://campus-club-backend.onrender.com";

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

  const registrationId = Number(location.state?.registrationId);
  const eventName =
    location.state?.eventName || "Technical Symposium";
  const studentName =
    location.state?.studentName || "Student";

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (loading || paid) return;

    if (!Number.isInteger(registrationId) || registrationId <= 0) {
      setMessage(
        "Registration ID is missing. Please register for the event again."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const scriptLoaded = await loadRazorpay();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection."
        );
      }

      // Create a Razorpay order through the backend.
      const { data: order } = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { registrationId }
      );

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Campus Club",
        description: `Event Registration: ${eventName}`,
        order_id: order.orderId,

        prefill: {
          name: studentName
        },

        theme: {
          color: "#13845b"
        },

        handler: async function (response) {
          try {
            setMessage("Verifying your payment...");

            const { data } = await axios.post(
              `${API_URL}/api/payment/verify`,
              {
                registrationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            if (data.success) {
              setPaid(true);
              setMessage(
                "Payment successful! Your registration is confirmed."
              );
            } else {
              setMessage(
                data.message || "Payment verification failed."
              );
            }
          } catch (error) {
            console.error("Verification error:", error);

            setMessage(
              error.response?.data?.message ||
              "Payment verification failed. Check your registration status before trying again."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage("Payment window closed. You can try again.");
          }
        }
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
      console.error("Payment error:", error);

      setMessage(
        error.response?.data?.message ||
        error.message ||
        "Unable to start payment. Check whether the backend is running."
      );

      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h1>Event Payment</h1>

        <p className="subtitle">
          Complete your event registration securely using Razorpay.
        </p>

        <div className="event-details">
          <p>
            <strong>Event:</strong> {eventName}
          </p>

          <p>
            <strong>Student:</strong> {studentName}
          </p>

          <p>
            <strong>Registration ID:</strong>{" "}
            {registrationId || "Missing"}
          </p>
        </div>

        <div className="fee-box">
          <p>Registration Fee</p>
          <h2>₹100.00</h2>
        </div>

        <button
          className="pay-button"
          onClick={handlePayment}
          disabled={loading || paid}
        >
          {paid
            ? "Payment Completed"
            : loading
            ? "Processing..."
            : "Pay ₹100 Now"}
        </button>

        {message && (
          <p
            className={`payment-message ${paid ? "success" : ""}`}
            role="status"
          >
            {message}
          </p>
        )}

        {paid && (
          <button
            className="back-button"
            onClick={() => navigate("/events")}
          >
            Back to Events
          </button>
        )}

        <div className="payment-note">
          Use Razorpay Test Mode during development.
          The backend must verify payment before marking
          the registration as paid.
        </div>
      </div>
    </div>
  );
}
