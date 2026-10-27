import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MyEvents.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).trim().replace(/\/+$/, '');

function MyEvents() {
  const [email, setEmail] = useState(
    localStorage.getItem('student_email') || ''
  );
  const [searchEmail, setSearchEmail] = useState(email);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyEvents = async (emailToSearch) => {
    if (!emailToSearch.trim()) {
      setError('Please enter the email used during registration.');
      setEvents([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_URL}/api/registrations`,
        {
          params: { email: emailToSearch.trim() }
        }
      );

      setEvents(response.data);
      setEmail(emailToSearch.trim());
      localStorage.setItem('student_email', emailToSearch.trim());
    } catch (err) {
      console.error('Error fetching registered events:', err);
      setError('Unable to load your events. Please check your backend.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchMyEvents(email);
    }
  }, []);

  const formatDate = (value) => {
    if (!value) return 'Date not available';

    const parts = String(value).slice(0, 10).split('-');

    if (parts.length !== 3) return 'Date not available';

    const [year, month, day] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (Number.isNaN(date.getTime())) return 'Date not available';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <main className="my-events-page">
      <h1>My Registered Events</h1>
      <p>View all the campus events you have registered for.</p>

      <form
        className="my-events-search"
        onSubmit={(e) => {
          e.preventDefault();
          fetchMyEvents(searchEmail);
        }}
      >
        <input
          type="email"
          placeholder="Enter your registration email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Find My Events'}
        </button>
      </form>

      {loading && <p>Loading your registered events...</p>}

      {error && <p className="my-events-error">{error}</p>}

      {!loading && !error && email && events.length === 0 && (
        <p className="my-events-empty">
          No registrations found for {email}.
        </p>
      )}

      {!loading && events.length > 0 && (
        <div className="my-events-grid">
          {events.map((event) => (
            <article className="my-event-card" key={event.id}>
              <h2>{event.title}</h2>

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
                ✉️ <strong>Email:</strong> {event.student_email}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyEvents;