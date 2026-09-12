function EventCard({ event, onRegister }) {
  return (
    <div className="event-card">
      <h2>{event.title}</h2>
      <p>📅 <b>Date:</b> {event.date}</p>
      <p>⏰ <b>Time:</b> {event.time}</p>
      <p>📍 <b>Venue:</b> {event.venue}</p>
      <p>👥 <b>Organizer:</b> {event.organizer}</p>
      <p>{event.description}</p>
      <button onClick={() => onRegister(event.title)}> Register Now </button>
    </div>
  );
}

export default EventCard;