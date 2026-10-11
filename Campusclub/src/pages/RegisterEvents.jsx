import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/RegisterEvent.css';

function RegisterEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [formData, setFormData] = useState({
    student_name: '',
    register_number: '',
    department: '',
    year_of_student: '',
    student_email: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!event?.id) {
      setMessage('Event details are missing. Please select an event again.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setMessage('Enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/registrations',
        {
          event_id: event.id,
          ...formData
        }
      );

      setMessage(response.data.message || 'Registration successful!');

      setTimeout(() => {
        navigate('/my-events');
      }, 1200);
    } catch (error) {
      console.error('Registration error:', error);

      setMessage(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="register-event-page">
        <div className="register-event-card">
          <h2>Event Not Selected</h2>
          <p>Please select an event before registering.</p>
          <button onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-event-page">
      <div className="register-event-card">
        <div className="register-event-icon">📝</div>

        <h1>Event Registration</h1>

        <p className="register-event-subtitle">
          Register for <strong>{event.title}</strong> by completing your details.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="student_name">Full Name *</label>
          <input
            id="student_name"
            name="student_name"
            type="text"
            placeholder="Enter your full name"
            value={formData.student_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="register_number">Register Number *</label>
          <input
            id="register_number"
            name="register_number"
            type="text"
            placeholder="Enter your register number"
            value={formData.register_number}
            onChange={handleChange}
            required
          />

          <label htmlFor="department">Department *</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="AIDS">AI & Data Science (AIDS)</option>
            <option value="AIML">AI & Machine Learning (AIML)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EEE">Electrical (EEE)</option>
            <option value="MECH">Mechanical (MECH)</option>
            <option value="CIVIL">Civil (CIVIL)</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="year_of_student">Year of Study *</label>
          <select
            id="year_of_student"
            name="year_of_student"
            value={formData.year_of_student}
            onChange={handleChange}
            required
          >
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <label htmlFor="student_email">College Email *</label>
          <input
            id="student_email"
            name="student_email"
            type="email"
            placeholder="Enter your college email"
            value={formData.student_email}
            onChange={handleChange}
            required
          />

          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>

          {message && (
            <p className="register-event-message" role="status">
              {message}
            </p>
          )}

          <button
            type="button"
            className="register-back-button"
            onClick={() => navigate('/events')}
          >
            ← Back to Events
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterEvent;
