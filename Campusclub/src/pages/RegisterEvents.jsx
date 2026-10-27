import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/RegisterEvent.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).trim().replace(/\/+$/, '');

function RegisterEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    register_number: '',
    department: '',
    year_of_student: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!event || !event.id) {
      setMessage('Event details missing. Please select an event again.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/registrations`,
        {
          event_id: event.id,
          ...formData
        }
      );

      const registrationId = response.data.registrationId;

      if (!registrationId) {
        setMessage('Registration ID was not returned by the server.');
        return;
      }

      navigate('/payment', {
        state: {
          registrationId,
          event,
          studentName: formData.student_name,
          studentEmail: formData.student_email,
          phone: formData.phone
        }
      });
    } catch (error) {
      console.error('Registration error:', error);

      setMessage(
        error.response?.data?.message ||
        'Registration failed. Please check whether the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="register-event-page">
        <div className="register-event-card">
          <h2>No Event Selected</h2>
          <p>Please select an event before registering.</p>
          <button type="button" onClick={() => navigate('/events')}>
            Go to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-event-page">
      <div className="register-event-card">
        <h1>Event Registration</h1>

        <p className="selected-event">
          Selected Event: <strong>{event.title || event.name}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="student_name">Student Name</label>
          <input
            id="student_name"
            name="student_name"
            type="text"
            value={formData.student_name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="student_email">Email Address</label>
          <input
            id="student_email"
            name="student_email"
            type="email"
            value={formData.student_email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="register_number">Register Number</label>
          <input
            id="register_number"
            name="register_number"
            type="text"
            value={formData.register_number}
            onChange={handleChange}
            placeholder="Enter your register number"
            required
          />

          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select your department</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="CSE">Computer Science Engineering (CSE)</option>
            <option value="AIDS">AI and Data Science (AI&DS)</option>
            <option value="AIML">AI and Machine Learning (AI&ML)</option>
            <option value="ECE">Electronics and Communication Engineering</option>
            <option value="EEE">Electrical and Electronics Engineering</option>
            <option value="MECH">Mechanical Engineering</option>
            <option value="CIVIL">Civil Engineering</option>
            <option value="CSBS">Computer Science and Business Systems</option>
            <option value="CYBER">Cyber Security</option>
            <option value="IOT">Internet of Things (IoT)</option>
            <option value="OTHER">Other</option>
          </select>

          <label htmlFor="year_of_student">Year of Study</label>
          <select
            id="year_of_student"
            name="year_of_student"
            value={formData.year_of_student}
            onChange={handleChange}
            required
          >
            <option value="">Select your year</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </select>

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            pattern="[0-9]{10}"
            maxLength="10"
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Registering...'
              : 'Register & Continue to Payment'}
          </button>
        </form>

        {message && (
          <p className="register-message" role="alert">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default RegisterEvent;