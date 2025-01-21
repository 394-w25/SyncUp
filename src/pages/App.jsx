import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { handleAuth as googleHandleAuth } from '../services/googleAuth';
import { initializeGAPIClient } from '../services/googleCalender';
import { importEvents } from '../utils/importEvents';
import { calculateAvailability } from '../utils/availability';
import "./App.css"; // Import the new CSS file

import '../styles/globals.css';

import CalendarHeader from '../components/CalendarHeader'
import GroupAvailability from '../components/GroupAvailability';
import IndividualAvailability from '../components/IndividualAvailability';
// import "./App.css"; // Import the new CSS file
import MeetingInfo from '../components/meetingInfo';
import AvailabilityStatus from '../components/AvailabilityStatus';
import Legend from '../components/Legend';
import Calendar from '../components/Calendar';
import { Group } from '@mui/icons-material';

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
        const storedUserId = localStorage.getItem('user-id');
        if (storedAuth === 'true' && storedUserId) {
          setIsAuthenticated(true);
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
  const participants = [
    { name: "Alice", status: true },
    { name: "Bob", status: false },
    { name: "Charlie", status: true },
    { name: "Devin", status: true },
    { name: "Ellie", status: false },
    { name: "Ferris", status: false },
  ];

  return (
    <div className="app-container w-full flex flex-col gap-4 pb-4">
      {/* top row, header and legend */}
      <div className='flex gap-4'>
        <div className='w-[70%] h-full'>
          <Calendar 
            isAuthenticated={isAuthenticated}
            handleAuth={handleGoogleAuth}
            handleGetEvents={handleImportEvents}
            events={events}
            startDate="2025-01-13"
            endDate="2025-01-20"
          />
        </div>
        <div className='w-[30%] h-full flex flex-col gap-4 mr-4'>
          <Legend meetingID={'rewnd7'} eventName={'394 meeting'} participants={participants}/>  
          <GroupAvailability />
        </div>
      </div>
      
      <div className="grid-container px-4">
        {/* <IndividualAvailability
          isAuthenticated={isAuthenticated}
          handleAuth={handleAuth}
          handleGetEvents={handleGetEvents}
          events={events}
        /> */}
        {/* <GroupAvailability /> */}

        {/* <AvailabilityStatus /> */}

        {/* <MeetingInfo 
          meetingId="3xfd1" 
          event="394 Weekly" 
          participants={participants} 
        /> */}
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
    </div>
  );
};

export default App;