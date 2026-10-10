import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/JoinClub.css';

function JoinClub() {
  const location = useLocation();
  const navigate = useNavigate();
  const club = location.state?.club;

  const [formData, setFormData] = useState({
    student_name: '',
    register_number: '',
    department: '',
    year_of_student: '',
    student_email: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!club?.id) {
      setMessage('Club information is missing. Please select a club again.');
      return;
    }

    const allFieldsFilled = Object.values(formData).every(
      (value) => String(value).trim() !== ''
    );

    if (!allFieldsFilled) {
      setMessage('Please fill in all required fields.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.student_email)) {
      setMessage('Please enter a valid college email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/clubs/join',
        {
          club_id: club.id,
          student_name: formData.student_name.trim(),
          register_number: formData.register_number.trim(),
          department: formData.department,
          year_of_student: formData.year_of_student,
          student_email: formData.student_email.trim(),
          phone: formData.phone.trim()
        }
      );

      setMessage(
        response.data.message || 'Successfully joined the club!'
      );

      setTimeout(() => {
        navigate('/clubs');
      }, 1200);
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="join-club-page">
      <div className="join-club-card">
        <div className="join-club-icon">🎓</div>

        <h1>Club Registration</h1>

        <p className="join-club-subtitle">
          Join <strong>{club?.name || 'your favourite club'}</strong> by
          completing your details.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="student_name">Full Name *</label>
            <input
              id="student_name"
              type="text"
              name="student_name"
              placeholder="Enter your full name"
              value={formData.student_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register_number">Register Number *</label>
            <input
              id="register_number"
              type="text"
              name="register_number"
              placeholder="Enter your register number"
              value={formData.register_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
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
          </div>

          <div className="form-group">
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
          </div>

          <div className="form-group">
            <label htmlFor="student_email">College Email *</label>
            <input
              id="student_email"
              type="email"
              name="student_email"
              placeholder="Enter your email"
              value={formData.student_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />
          </div>

          <button
            type="submit"
            className="join-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>

          {message && (
            <p className="join-message" role="status">
              {message}
            </p>
          )}

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate('/clubs')}
          >
            ← Back to Clubs
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinClub;
