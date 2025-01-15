import React, { useState } from 'react';
import CalendarEvents from './CalenderEvents';

const IndividualAvailability = ({ isAuthenticated, handleAuth, handleGetEvents, events }) => {
  return (
    <div className="calendar-container">
      <h2>Your Calendar</h2>
      {!isAuthenticated ? (
        <button onClick={handleAuth}>Sign In with Google</button>
      ) : (
        <>
          <button onClick={handleGetEvents}>Refresh Events</button>
          <CalendarEvents events={events} />
        </>
      )}
    </div>
  );
};

export default IndividualAvailability;