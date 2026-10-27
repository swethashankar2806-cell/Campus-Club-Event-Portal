import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).trim().replace(/\/+$/, '');

function Dashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch events from the backend
  useEffect(() => {
    axios
      .get(`${API_URL}/api/events`)
      .then((response) => {
        setEvents(response.data);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        setError('Unable to load events. Please check your backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Format the event date
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return { day: '--', month: 'TBA' };
    }

    const date = new Date(dateValue);

    return {
      day: date.getUTCDate().toString().padStart(2, '0'),
      month: date
        .toLocaleString('en-US', {
          month: 'short',
          timeZone: 'UTC'
        })
        .toUpperCase()
    };
  };

  return (
    <main className="dashboard">
      <div className="welcome-box">
        <h1>Welcome to Campus Club</h1>
        <p>
          Discover clubs, events and activities happening on campus.
        </p>
      </div>

      <h2 className="section-title">Upcoming Events</h2>

      {loading ? (
        <p className="dashboard-message">Loading events...</p>
      ) : error ? (
        <p className="dashboard-error">{error}</p>
      ) : events.length === 0 ? (
        <p className="dashboard-message">
          No events available. Check back soon!
        </p>
      ) : (
        <div className="event-grid">
          {events.map((event) => {
            const date = formatDate(event.event_date);

            return (
              <div className="event-card" key={event.id}>
                <div className="event-date">
                  <strong>{date.day}</strong>
                  <span>{date.month}</span>
                </div>

                <div className="event-details">
                  <h3>{event.title}</h3>

                  <p>
                    {event.organizer || 'Campus Event'}
                  </p>

                  <p>📍 {event.venue || 'Venue to be announced'}</p>

                  <p>⏰ {event.event_time || 'Time to be announced'}</p>

                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                  >
                    View Event →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="section-title">Quick Access</h2>

      <div className="quick-grid">
        <div
          className="quick-card"
          onClick={() => navigate('/events')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/events');
          }}
        >
          <h3>📅 Events</h3>
          <p>View upcoming campus events.</p>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate('/clubs')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/clubs');
          }}
        >
          <h3>🎓 Clubs</h3>
          <p>Explore and join campus clubs.</p>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate('/my-events')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/my-events');
          }}
        >
          <h3>📝 My Events</h3>
          <p>View your registered events.</p>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/profile');
          }}
        >
          <h3>👤 Profile</h3>
          <p>Manage your profile details.</p>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
