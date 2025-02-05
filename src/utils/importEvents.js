import { getGoogleCalendarEvents } from '../services/googleCalender';
import { setDoc, doc } from "firebase/firestore";
import { db } from '../firebase'; // Assuming you have a firebase.js file for Firestore

export const importEvents = async (userId, startDate, endDate) => {
  try {
    console.log('Received user ID:', userId);
    if (!userId) {
      throw new Error('User ID is null or undefined');
    }
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const start = new Date(startDate.toISOString().split('T')[0] + 'T00:00:00');
    const end = new Date(endDate.toISOString().split('T')[0] + 'T23:59:59');

    console.log('Input dates:', { startDate, endDate });
    console.log('Fetching events between:', start, 'and', end);
    
    const events = await getGoogleCalendarEvents(start, end);
    const eventsByDate = {};

    events.forEach(event => {
      if (event.start && event.start.dateTime && event.end && event.end.dateTime) {
        const eventStartDate = new Date(event.start.dateTime);
        const eventDate = eventStartDate.toISOString().split('T')[0];
        
        // Check if event starts within our date range
        if (eventStartDate >= start && eventStartDate <= end) {
          if (!eventsByDate[eventDate]) {
            eventsByDate[eventDate] = [];
          }
          eventsByDate[eventDate].push({
            title: event.summary,
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
            isGoogleCalEvent: true,
            googleCalEventId: event.id,
            lastSync: new Date()
          });
        }
      }
    });

    // Save events to Firestore
    for (const [date, events] of Object.entries(eventsByDate)) {
      const docId = `${userId}_${date}`;
      console.log('Saving document with ID:', docId);
      await setDoc(doc(db, "calendarEvents", docId), {
        userId,
        date: new Date(date),
        events
      });
    }

    return events;
  } catch (error) {
    console.error('Error importing events:', error);
    throw error;
  }
};