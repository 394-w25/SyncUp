import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { handleAuth as googleHandleAuth } from '../services/googleAuth';
import { initializeGAPIClient } from '../services/googleCalender';
import { importEvents } from '../utils/importEvents';
import { calculateAvailability } from '../utils/availability';
import "./App.css"; // Import the new CSS file

import '../styles/globals.css';

import GroupAvailability from '../components/GroupAvailability';
import Legend from '../components/Legend';
import Calendar from '../components/Calendar';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [startDate, setStartDate] = useState("2025-01-19");
  const [endDate, setEndDate] = useState("2025-01-25");
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(21);

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
            startDate={startDate}
            endDate={endDate}
            userId={userId}
            startTime={startTime}
            endTime={endTime}
          />
        </div>
        <div className='w-[30%] h-full flex flex-col gap-4 mr-4'>
          <Legend meetingID={'rewnd7'} eventName={'394 meeting'} participants={participants}/>  
          <GroupAvailability />
        </div>
      </div>
      
      {/* <div className="grid-container px-4">
        {!isAuthenticated ? (
          <button onClick={handleGoogleAuth}>Sign in with Google</button>
        ) : (
          <>
            {events.length > 0 ? (
              <div className="events-list">
                <h2 className="text-xl font-semibold mb-4">Imported Events</h2>
                <div className="space-y-2">
                  {events.map((event) => {
                    const startTime = new Date(event.start.dateTime).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const endTime = new Date(event.end.dateTime).toLocaleString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <div key={event.id} className="p-3 bg-gray-100 rounded-lg">
                        <div className="font-medium">{event.summary}</div>
                        <div className="text-gray-600 text-sm">
                          {startTime} - {endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>No events imported</p>
            )}
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
      </div> */}
    </div>
  );
};

export default App;