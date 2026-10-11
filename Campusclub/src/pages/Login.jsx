import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Save the logged-in user's details
    localStorage.setItem('student_name', username.trim());
    localStorage.setItem('student_email', email.trim());
    localStorage.setItem('user_role', role);

    // Open the correct dashboard
    if (role === 'student') {
      navigate('/dashboard');
    } else if (role === 'coordinator') {
      navigate('/coordinator');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img
          src="/logo.jpeg"
          alt="Campus Club Logo"
          className="login-logo"
        />

        <h1>Campus Club</h1>
        <p className="login-subtitle">
          Campus Club &amp; Event Management Portal
        </p>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="student">Student</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;