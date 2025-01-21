import { getGoogleCalendarEvents } from '../services/googleCalender';
import { setDoc, doc } from "firebase/firestore";
import { db } from '../firebase'; // Assuming you have a firebase.js file for Firestore

export const importEvents = async (userId) => {
  try {
    console.log('Received user ID:', userId); // Debugging log
    if (!userId) {
      throw new Error('User ID is null or undefined');
    }

    const events = await getGoogleCalendarEvents();
    const limitedEvents = events.slice(0, 5); // Limit to 5 events
    const eventsByDate = {};

    // Organize events by date
    limitedEvents.forEach(event => {
      if (event.start && event.start.dateTime && event.end && event.end.dateTime) {
        const date = new Date(event.start.dateTime).toISOString().split('T')[0]; // Get date as YYYY-MM-DD
        if (!eventsByDate[date]) {
          eventsByDate[date] = [];
        }
        eventsByDate[date].push({
          title: event.summary,
          start: new Date(event.start.dateTime),
          end: new Date(event.end.dateTime),
          isGoogleCalEvent: true,
          googleCalEventId: event.id,
          lastSync: new Date()
        });
      }
    });

    // Save events to Firestore
    for (const [date, events] of Object.entries(eventsByDate)) {
      const docId = `${userId}_${date}`;
      console.log('Saving document with ID:', docId); // Debugging log
      await setDoc(doc(db, "calendarEvents", docId), {
        userId,
        date: new Date(date),
        events
      });
    }

    return limitedEvents;
  } catch (error) {
    console.error('Error importing events:', error);
    throw error;
  }
};