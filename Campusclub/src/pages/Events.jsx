import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/events')
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Unable to load events. Please check your backend.');
        setLoading(false);
      });
  }, []);

  const handleRegister = async (event) => {
    const student_name = prompt('Enter your name:');
    if (!student_name || !student_name.trim()) return;

    const student_email = prompt('Enter your email:');
    if (!student_email || !student_email.trim()) return;

    try {
      const response = await axios.post(
        'http://localhost:5000/api/registrations',
        {
          event_id: event.id,
          student_name: student_name.trim(),
          student_email: student_email.trim()
        }
      );

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  if (loading) {
    return <p className="events-message">Loading events...</p>;
  }

  if (error) {
    return <p className="events-error">{error}</p>;
  }

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
      <p className="events-subtitle">
        Discover campus activities and register for your favourite events.
      </p>

      {events.length === 0 ? (
        <p className="events-message">No events available.</p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div className="event-card" key={event.id}>
              <div className="event-card-top">
                <span className="event-tag">CAMPUS EVENT</span>
                <span className="event-icon">🎉</span>
              </div>

              <h2>{event.title}</h2>
              <p className="event-description">{event.description}</p>

              <div className="event-details">
                <p>📅 <strong>Date:</strong>{' '}
                  {new Date(event.event_date + 'T00:00:00')
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                </p>
                <p>🕒 <strong>Time:</strong> {event.event_time}</p>
                <p>📍 <strong>Venue:</strong> {event.venue}</p>
                <p>👥 <strong>Organizer:</strong> {event.organizer}</p>
              </div>

              <button
                className="register-btn"
                onClick={() => handleRegister(event)}
              >
                Register Now →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
