import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import CalendarEvents from './CalenderEvents';
import "./GroupAvailability.css";

const CLIENT_ID = '308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com'; // Replace with your client ID
const API_KEY = 'AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho'; 
const CALENDAR_ID = 'primary'; // Use 'primary' to access the user's primary calendar
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

const data = [
  { available: 0, userCount: 0 },
  { available: 1, userCount: 1 },
  { available: 2, userCount: 3 },
  { available: 2, userCount: 3 },
  { available: 1, userCount: 1 },
  { available: 3, userCount: 3 },
  { available: 2, userCount: 3 },
  { available: 0, userCount: 0 },
  { available: 0, userCount: 0 },
  { available: 0, userCount: 0 },
  { available: 2, userCount: 3 },
  { available: 3, userCount: 3 },
  { available: 4, userCount: 3 },
];

const App = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
        })
        .then(() => {
          const storedAuth = localStorage.getItem('google-auth');
          if (storedAuth === 'true') {
            setIsAuthenticated(true);
          }
        });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const handleAuth = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      localStorage.setItem('google-auth', 'true');
      setIsAuthenticated(true);
      console.log('User signed in');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleGetEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      const data = response.result.items;

      if (data.length) {
        console.log('Events JSON:', JSON.stringify(data, null, 2));
        setEvents(data);
      } else {
        console.log('No events found');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>SyncUp</h1>
        <div className="date-selector">
          <h2>January 2025</h2>
        </div>
      </header>

      <main>
        {/* Left Side: Calendar */}
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
      </main>
      <div className="group-availability">
      <h3>Group Availbility</h3>
      {data.map((item, index) => (
        <div
          key={index}
          className={`availability-item ${
            item.available === 0
              ? "light-red"
              : item.available === 1
              ? "red"
              : item.available === 2
              ? "yellow"
              : item.available === 3
              ? "green"
              : "dark-green"
          }`}
        >
          <span className="availability-text">
            {item.available} available
          </span>
          <div className="user-count">
            {typeof item.userCount === "number" && item.userCount > 0
              ? Array(item.userCount)
                  .fill(0)
                  .map((_, i) => <span key={i} className="user-icon" />)
              : typeof item.userCount === "string"
              ? item.userCount
              : null}
          </div>
        </div>
      ))}
    </div>

      <footer>
        <button>
          <span>SyncUp!</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
