import { getUsersEmails } from '../firebase';
// import { refreshGoogleToken } from '../services/googleAuth';

// same
export const initializeGAPIClient = async () => {
    try {
      await gapi.client.init({
        apiKey: "AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho", // Replace with your actual API key
        clientId: "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com", // Replace with your actual client ID
        scope: "https://www.googleapis.com/auth/calendar",
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      });
  
      // console.log('GAPI client initialized');
    } catch (error) {
      console.error('Error initializing GAPI client:', error);
      throw error;
    }
  };

//same  
export const getGoogleCalendarEvents = async (startDate, endDate) => {
    try {
      // Ensure we're working with Date objects and proper timezone handling
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      
      console.log('Requesting events from Google Calendar:', {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        startDate: start.toLocaleString(),
        endDate: end.toLocaleString()
      });

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      const events = response.result.items;
      console.log(`Fetched ${events.length} events from Google Calendar`);
      return events;
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  };

const formatDateTime = (block) => {
  try {
    const [dateStr, hourStr, ampmMinutes] = block.split(" ");
    const [ampm, minutes] = ampmMinutes.split(":");

    let hour = parseInt(hourStr, 10);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    if (!minutes) {
      console.error("❌ Invalid time format, missing minutes:", block);
      throw new Error("Invalid time format");
    }

    const chicagoTime = new Date(`${dateStr}T${hour.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}:00-06:00`);
    const isoString = chicagoTime.toISOString();
    
    console.log("🌍 Converted Chicago Time:", chicagoTime, "ISO:", isoString);
    return isoString;
  } catch (error) {
    console.error("❌ Error formatting date:", block, error);
    throw error;
  }
};
