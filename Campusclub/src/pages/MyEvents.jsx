import { useState } from 'react';

function MyEvents() {
const [events, setEvents] = useState([
'Tech Fest 2026',
'Cultural Day'
]);

const removeEvent = (eventName) => {
setEvents(events.filter((event) => event !== eventName));
};

return ( <div className="my-events"> <h1>My Registered Events</h1>
  {events.length === 0 ? (
    <p>You have not registered for any events.</p>
  ) : (
    events.map((event, index) => (
      <div key={index}>
        <span>{event}</span>
        <button onClick={() => removeEvent(event)}>
          Cancel Registration
        </button>
      </div>
    ))
  )}
</div>

);
}

export default MyEvents;
