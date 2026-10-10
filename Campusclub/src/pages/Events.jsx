
import EventCard from '../components/EventCard.jsx';
import '../styles/Events.css';
function Events() {
  const events = [
    {
      id: 1,
      title: 'Technical Symposium',
      date: '20 September 2026',
      time: '10:00 AM',
      venue: 'Seminar Hall',
      organizer: 'IT Department',
      description: 'Technical events, coding contests and workshops.'
    },
    {
      id: 2,
      title: 'Cultural Fest',
      date: '25 September 2026',
      time: '9:00 AM',
      venue: 'College Auditorium',
      organizer: 'Cultural Club',
      description: 'Dance, music, singing and cultural performances.'
    },
    {
      id: 3,
      title: 'Sports Meet',
      date: '30 September 2026',
      time: '8:00 AM',
      venue: 'College Ground',
      organizer: 'Sports Club',
      description: 'Indoor and outdoor sports competitions.'
    }
  ];
  const handleRegister = (eventTitle) => {
    alert(`Successfully registered for ${eventTitle}!`);
  };
  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
      <div className="events-list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onRegister={handleRegister}
          />
        ))}
      </div>
    </div>
  );
}
export default Events;