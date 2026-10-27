import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Events.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).trim().replace(/\/+$/, '');

function Events() {
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

  // Format MySQL DATE values safely
  const formatDate = (value) => {
    if (!value) return 'Date not available';

    const parts = String(value).slice(0, 10).split('-');

    if (
      parts.length !== 3 ||
      !parts.every((part) => /^\d+$/.test(part))
    ) {
      return 'Date not available';
    }

    const [year, month, day] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (Number.isNaN(date.getTime())) {
      return 'Date not available';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Open registration on a separate page
  const handleRegister = (event) => {
    navigate('/register-event', {
      state: { event }
    });
  };

  return (
    <main className="events-page">
      <h1>Upcoming Events</h1>

      <p className="events-subtitle">
        Discover campus activities and register for your favourite events.
      </p>

      {loading && (
        <p className="dashboard-message">Loading events...</p>
      )}

      {error && (
        <p className="events-error">{error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="dashboard-message">
          No events available at the moment.
        </p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="event-cards">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <p className="event-category">
                CAMPUS EVENT 🎉
              </p>

              <h2>{event.title}</h2>

              <p className="event-description">
                {event.description ||
                  'Join us for this exciting campus event.'}
              </p>

              <p>
                🗓️ <strong>Date:</strong>{' '}
                {formatDate(event.event_date)}
              </p>

              <p>
                🕒 <strong>Time:</strong>{' '}
                {event.event_time || 'To be announced'}
              </p>

              <p>
                📍 <strong>Venue:</strong>{' '}
                {event.venue || 'To be announced'}
              </p>

              <p>
                👥 <strong>Organizer:</strong>{' '}
                {event.organizer || 'Campus Club'}
              </p>

              <button
                type="button"
                className="register-btn"
                onClick={() => handleRegister(event)}
              >
                Register Now →
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Events;