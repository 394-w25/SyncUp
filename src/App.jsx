import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { auth, db, GoogleAuthProvider, signInWithPopup } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import CalendarHeader from './CalendarHeader';
import GroupAvailability from './GroupAvailability';
import IndividualAvailability from './IndividualAvailability';
import "./GroupAvailability.css";
import "./App.css"; // Import the new CSS file
import MeetingInfo from './meetingInfo';
import AvailabilityStatus from './AvailabilityStatus';

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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      });

      localStorage.setItem('google-auth', 'true');
      setIsAuthenticated(true);
      console.log('User signed in and data stored in Firestore');
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
        setEvents(data); // Set events in state
  
        // Process and store availability in Firestore
        const user = auth.currentUser;
        const userId = user.uid;
        const availabilityByDate = {};
  
        data.forEach(event => {
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          const date = eventStart.toISOString().split('T')[0];
  
          // Define the base availability range (8:00 AM to 10:00 PM)
          if (!availabilityByDate[date]) {
            const startOfDay = new Date(date);
            startOfDay.setHours(8, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(22, 0, 0, 0);
            availabilityByDate[date] = [{ start: startOfDay, end: endOfDay }];
          }
  
          // Update availability by subtracting event times
          availabilityByDate[date] = availabilityByDate[date].flatMap(slot => {
            if (eventStart >= slot.end || eventEnd <= slot.start) {
              // No overlap
              return [slot];
            } else if (eventStart <= slot.start && eventEnd >= slot.end) {
              // Event completely covers the slot
              return [];
            } else if (eventStart > slot.start && eventEnd < slot.end) {
              // Event is within the slot
              return [
                { start: slot.start, end: eventStart },
                { start: eventEnd, end: slot.end }
              ];
            } else if (eventStart <= slot.start) {
              // Event overlaps the start of the slot
              return [{ start: eventEnd, end: slot.end }];
            } else {
              // Event overlaps the end of the slot
              return [{ start: slot.start, end: eventStart }];
            }
          });
        });
  
        // Save to Firestore
        for (const [date, slots] of Object.entries(availabilityByDate)) {
          await setDoc(doc(db, "availability", `${userId}_${date}`), {
            userId,
            date: new Date(date),
            slots: slots.map(slot => ({
              start: slot.start.toISOString(),
              end: slot.end.toISOString(),
              status: "available"
            })),
            lastUpdate: new Date(),
          });
        }
  
        console.log('Availability stored in Firestore');
      } else {
        console.log('No events found');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.result && error.result.error) {
        console.error('Error details:', error.result.error.message);
      }
    }
  };
  

  const participants = [
    { name: 'Alice', attending: true },
    { name: 'Bob', attending: false },
    { name: 'Charlie', attending: true },
  ];

  return (
    <div className="app-container">
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