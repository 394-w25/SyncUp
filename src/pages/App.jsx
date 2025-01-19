import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

import '../styles/globals.css';

import CalendarHeader from '../components/CalendarHeader'
import GroupAvailability from '../components/GroupAvailability';
import IndividualAvailability from '../components/IndividualAvailability';
// import "./App.css"; // Import the new CSS file
import MeetingInfo from '../components/meetingInfo';
import AvailabilityStatus from '../components/AvailabilityStatus';

const CLIENT_ID = '308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com'; // Replace with your client ID
const API_KEY = 'AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho'; 
const CALENDAR_ID = 'primary'; // Use 'primary' to access the user's primary calendar
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

const App = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      }).then(() => {
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
        setEvents(data);  // Set events in state
      } else {
        console.log('No events found');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const participants = [
    { name: 'Alice', attending: true },
    { name: 'Bob', attending: false },
    { name: 'Charlie', attending: true },
  ];

  return (
    <div className="app-container w-full">
      <CalendarHeader />
      <div className="grid-container">
        <div className="calendar-containter">
          <IndividualAvailability
            isAuthenticated={isAuthenticated}
            handleAuth={handleAuth}
            handleGetEvents={handleGetEvents}
            events={events}
          />
        </div>
        <div className="group-avaibility">
          <GroupAvailability />
        </div>

        <AvailabilityStatus />

        <MeetingInfo 
          meetingId="3xfd1" 
          event="394 Weekly" 
          participants={participants} 
        />
      </div>
    </div>
  );
};

export default App;
