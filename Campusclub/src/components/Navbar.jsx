
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Campus Club</h2>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/events">Events</Link>
        <Link to="/my-events">My Events</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <p>Event Management Portal</p>
    </nav>
  );
}

export default Navbar;