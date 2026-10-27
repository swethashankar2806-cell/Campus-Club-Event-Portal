import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/JoinClub.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).trim().replace(/\/+$/, '');

function JoinClub() {
  const location = useLocation();
  const navigate = useNavigate();

  const club = location.state?.club || {
    id: '',
    name: 'Campus Club',
  };

  const [formData, setFormData] = useState({
    student_name: '',
    register_number: '',
    department: '',
    year_of_study: '',
    student_email: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate all required fields
    const allFilled = Object.values(formData).every(
      (value) => value.trim() !== ''
    );

    if (!allFilled) {
      setMessage('Please fill in all required club registration fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.student_email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!club.id) {
      setMessage(
        'Club information is missing. Please return to Clubs and select a club.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/clubs/join`,
        {
          club_id: club.id,
          student_name: formData.student_name.trim(),
          register_number: formData.register_number.trim(),
          department: formData.department.trim(),
          year_of_study: formData.year_of_study,
          student_email: formData.student_email.trim(),
          phone: formData.phone.trim(),
        }
      );

      localStorage.setItem(
        'student_name',
        formData.student_name.trim()
      );
      localStorage.setItem(
        'student_email',
        formData.student_email.trim()
      );
      localStorage.setItem(
        'student_department',
        formData.department.trim()
      );

      setMessage(
        response.data.message || 'Successfully joined the club!'
      );

      setTimeout(() => {
        navigate('/clubs');
      }, 1500);
    } catch (error) {
      console.error(
        'Club registration error:',
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          'Registration failed. Please check your backend and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-club-page">
      <div className="join-club-card">
        <h1>Join {club.name}</h1>
        <p className="join-club-subtitle">
          Enter your student details to register for this club.
        </p>

        <form onSubmit={handleSubmit} noValidate>
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
            <option value="Information Technology">
              Information Technology
            </option>
            <option value="Computer Science Engineering">
              Computer Science Engineering
            </option>
            <option value="Artificial Intelligence and Data Science">
              Artificial Intelligence and Data Science
            </option>
            <option value="Electronics and Communication Engineering">
              Electronics and Communication Engineering
            </option>
            <option value="Electrical and Electronics Engineering">
              Electrical and Electronics Engineering
            </option>
            <option value="Mechanical Engineering">
              Mechanical Engineering
            </option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="year_of_study">Year of Study *</label>
          <select
            id="year_of_study"
            name="year_of_study"
            value={formData.year_of_study}
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
            inputMode="numeric"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>

          {message && (
            <p className="join-club-message" role="status">
              {message}
            </p>
          )}
        </form>

        <button
          type="button"
          className="back-to-clubs"
          onClick={() => navigate('/clubs')}
        >
          ← Back to Clubs
        </button>
      </div>
    </div>
  );
}

export default JoinClub;