<<<<<<< HEAD
import "../styles/Dashboard.css";
function Dashboard() {
  return (
    <main className="dashboard">

      <div className="welcome-box">

        <h1>Welcome to Campus Club</h1>

        <p>
          Discover clubs, events and activities happening on campus.
        </p>

      </div>

      <h2 className="section-title">
        Upcoming Events
      </h2>

      <div className="event-grid">

        {/* Event 1 */}

        <div className="event-card">

          <div className="event-date">
            <strong>20</strong>
            <span>SEP</span>
          </div>

          <div className="event-details">

            <h3>Tech Fest 2026</h3>

            <p>Technical Event</p>

            <p>📍 Main Auditorium</p>

            <p>⏰ 10:00 AM</p>

            <button>View Event</button>

          </div>

        </div>

        {/* Event 2 */}

        <div className="event-card">

          <div className="event-date">
            <strong>25</strong>
            <span>SEP</span>
          </div>

          <div className="event-details">

            <h3>Sports Meet</h3>

            <p>Sports Event</p>

            <p>📍 College Ground</p>

            <p>⏰ 9:00 AM</p>

            <button>View Event</button>

          </div>

        </div>

        {/* Event 3 */}

        <div className="event-card">

          <div className="event-date">
            <strong>02</strong>
            <span>OCT</span>
          </div>

          <div className="event-details">

            <h3>Cultural Fest</h3>

            <p>Cultural Event</p>

            <p>📍 Open Auditorium</p>

            <p>⏰ 4:00 PM</p>

            <button>View Event</button>

          </div>

        </div>

      </div>

      <h2 className="section-title">
        Quick Access
      </h2>

      <div className="quick-grid">

        <div className="quick-card">
          <h3>Events</h3>
          <p>View upcoming campus events.</p>
        </div>

        <div className="quick-card">
          <h3>Clubs</h3>
          <p>Explore and join campus clubs.</p>
        </div>

        <div className="quick-card">
          <h3>My Events</h3>
          <p>View your registered events.</p>
        </div>

        <div className="quick-card">
          <h3>Profile</h3>
          <p>Manage your profile details.</p>
        </div>

      </div>

    </main>
  );
}

export default Dashboard;
=======
<div className="event-cards">

  <div className="event-card">
    <div className="event-date">
      20
      <span>SEP</span>
    </div>

    <div className="event-info">
      <h3>Tech Fest 2026</h3>
      <p>Technical Event</p>
      <p>📍 Main Auditorium</p>
      <p>⏰ 10:00 AM</p>
      <button>View Event</button>
    </div>
  </div>

  <div className="event-card">
    <div className="event-date">
      25
      <span>SEP</span>
    </div>

    <div className="event-info">
      <h3>Sports Meet</h3>
      <p>Sports Event</p>
      <p>📍 College Ground</p>
      <p>⏰ 9:00 AM</p>
      <button>View Event</button>
    </div>
  </div>

  <div className="event-card">
    <div className="event-date">
      02
      <span>OCT</span>
    </div>

    <div className="event-info">
      <h3>Cultural Fest</h3>
      <p>Cultural Event</p>
      <p>📍 Open Auditorium</p>
      <p>⏰ 4:00 PM</p>
      <button>View Event</button>
    </div>
  </div>

</div>
>>>>>>> f8f353722619dbaadbdaaf5db18f0ae9097280f1
