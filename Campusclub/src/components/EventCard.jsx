function EventCard({ event, onRegister }) {
  return (
    <div className="event-card">
      <h2>{event.title}</h2>
      <p>📅 Date: {event.date}</p>
      <p>⏰ Time: {event.time}</p>
      <p>📍 Venue: {event.venue}</p>
      <p>👥 Organizer: {event.organizer}</p>
      <p>{event.description}</p>

      <button onClick={() => onRegister(event.title)}>
        Register Now
      </button>
    </div>
  );
}

export default EventCard;