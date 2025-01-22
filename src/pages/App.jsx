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
  const [startDate, setStartDate] = useState("2025-01-20");
  const [endDate, setEndDate] = useState("2025-01-26");
  const [startTime, setStartTime] = useState(8);
  const [endTime, setEndTime] = useState(18);

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
    </div>
  );
};

export default App;