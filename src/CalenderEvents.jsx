import React from 'react';

const CalendarEvents = ({ events }) => {
  return (
    <ul>
      {events.length > 0 ? (
        events.map((event) => (
          <li key={event.id}>
            <strong>{event.summary}</strong> - {event.start.dateTime || event.start.date}
          </li>
        ))
      ) : (
        <p>No events found</p>
      )}
    </ul>
  );
};

export default CalendarEvents;