import EventCard from "../components/EventCard"; 
import "../styles/Events.css";
function Events() { 
    const events = [ 
        { 
            id: 1, 
            title: "Technical Symposium", 
            date: "20 September 2026", 
            time: "10:00 AM", 
            venue: "Seminar Hall", 
            organizer: "IT Department", 
            description: "Technical events, coding contests and workshops." 
        }, 
        {
            id: 2, 
            title: "Cultural Fest", 
            date: "25 September 2026", 
            time: "9:00 AM", 
            venue: "College Auditorium", 
            organizer: "Cultural Club", 
            description: "Music, dance and cultural performances." 
        }, 
        { 
            id: 3,
            title: "Sports Meet", 
            date: "30 September 2026", 
            time: "8:00 AM", 
            venue: "College Ground", 
            organizer: "Sports Club", 
            description: "Various indoor and outdoor sports competitions." 
        } 
    ]; 
    const handleRegister = (eventName) => { 
        alert(`Registered for ${eventName}`); 
    }; 
    return ( 
    <div> 
        <h1>Upcoming Events</h1> 
        <div className="event-container"> 
            {events.map((event) => ( 
                <EventCard key={event.id} event={event} onRegister={handleRegister} /> 
            ))} 
        </div> 
    </div> 
    ); 
} 
export default Events;