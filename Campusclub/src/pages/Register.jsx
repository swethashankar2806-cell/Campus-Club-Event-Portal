
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).trim().replace(/\/+$/, '');

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/registrations`,
        {
          student_name: name.trim(),
          student_email: email.trim()
        }
      );

      const registrationId = response.data.registrationId;

      if (!registrationId) {
        throw new Error('Registration ID was not returned by the server.');
      }

      localStorage.setItem('student_name', name.trim());
      localStorage.setItem('student_email', email.trim());

      alert('Registration successful!');

      navigate('/payment', {
        state: {
          registrationId,
          studentName: name.trim(),
          studentEmail: email.trim()
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      alert(
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Student Registration</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;
