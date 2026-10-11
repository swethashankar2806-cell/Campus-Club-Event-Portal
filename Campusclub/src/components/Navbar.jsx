import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const studentName = localStorage.getItem('student_name') || 'Student';

  const handleLogout = () => {
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_email');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Campus Club</div>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/events">Events</Link>
        <Link to="/my-events">My Events</Link>
      </div>

      <div className="navbar-user">
        <Link to="/profile" className="navbar-profile">
          <span className="navbar-avatar">
            {studentName.charAt(0).toUpperCase()}
          </span>
          <span>My Profile</span>
        </Link>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;