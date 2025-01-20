import React from "react";
import './CalenderEvents.css';

const CalendarEvents = ({ events }) => {
  const calculatePosition = (dateTime) => {
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (hours * 60 + minutes) / (24 * 60) * 100; // Convert to percentage
  };

  return (
    <div className="calendar-container">
      <div className="calendar-grid">
        {Array.from({ length: 24 }).map((_, index) => (
          <div key={index} className="hour-block">
            {index+1}:00
          </div>
        ))}
      </div>
      <div className="calendar-events">
        {events.map((event) => (
          <div
            key={event.id}
            className="event-block"
            style={{
              top: `${calculatePosition(event.start.dateTime || event.start.date)}%`,
              height: `${calculatePosition(event.end.dateTime) - calculatePosition(event.start.dateTime)}%`,
            }}
          >
            <p className="event-summary">{event.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarEvents;