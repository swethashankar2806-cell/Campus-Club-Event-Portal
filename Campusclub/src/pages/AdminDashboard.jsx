import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="role-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage the Campus Club portal.</p>

      <nav>
        <Link to="/dashboard">Student Dashboard</Link>
        {' | '}
        <Link to="/clubs">Manage Clubs</Link>
        {' | '}
        <Link to="/events">Manage Events</Link>
      </nav>
    </div>
  );
}

export default AdminDashboard;