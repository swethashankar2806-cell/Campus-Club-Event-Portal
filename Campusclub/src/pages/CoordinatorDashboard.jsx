import { Link } from 'react-router-dom';

function CoordinatorDashboard() {
  return (
    <div className="role-dashboard">
      <h1>Coordinator Dashboard</h1>
      <p>Welcome to Event and Club Management.</p>

      <nav>
        <Link to="/events">View Events</Link>
        {' | '}
        <Link to="/clubs">View Clubs</Link>
      </nav>
    </div>
  );
}

export default CoordinatorDashboard;