import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { handleAuth as googleHandleAuth } from './services/googleAuth';
import { initializeGAPIClient } from './services/googleCalender';
import { importEvents } from './utils/importEvents';
import { calculateAvailability } from './utils/availability';
import "./App.css"; // Import the new CSS file

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        await initializeGAPIClient();
        const storedAuth = localStorage.getItem('google-auth');
        if (storedAuth === 'true') {
          setIsAuthenticated(true);
          const storedUserId = localStorage.getItem('user-id');
          setUserId(storedUserId);
          console.log('Stored user ID:', storedUserId); // Debugging log
        }
      } catch (error) {
        console.error('Error initializing GAPI client:', error);
      }
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const handleGoogleAuth = async () => {
    try {
      const user = await googleHandleAuth(setIsAuthenticated);
      setUserId(user.uid);
      localStorage.setItem('user-id', user.uid);
      console.log('User ID set:', user.uid); // Debugging log
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  const handleImportEvents = async () => {
    try {
      console.log('Importing events for user ID:', userId); // Debugging log
      if (!userId) {
        throw new Error('User ID is null or undefined');
      }
      const events = await importEvents(userId);
      setEvents(events);
      const availability = calculateAvailability(events);
      setAvailability(availability);
    } catch (error) {
      console.error('Error importing events:', error);
    }
  };

  useEffect(() => {
    console.log('User ID updated:', userId); // Debugging log
  }, [userId]);

  return (
    <div className="App">
      {!isAuthenticated ? (
        <button onClick={handleGoogleAuth}>Sign in with Google</button>
      ) : (
        <>
          <button onClick={handleImportEvents}>Import Events from Google Calendar</button>
          <div>
            {events.length > 0 ? (
              <ul>
                {events.map((event) => (
                  <li key={event.id}>
                    {event.summary} - {new Date(event.start.dateTime).toLocaleString()} to {new Date(event.end.dateTime).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events imported</p>
            )}
          </div>
          <div>
            <h2>Availability</h2>
            {availability.length > 0 ? (
              <ul>
                {availability.map((day) => (
                  <li key={day.date}>
                    {day.date}
                    <ul>
                      {day.slots.map((slot, index) => (
                        <li key={index}>
                          {new Date(slot.start).toLocaleTimeString()} - {new Date(slot.end).toLocaleTimeString()}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No availability calculated</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;