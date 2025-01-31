import { getUsersEmails } from '../firebase';
import { refreshGoogleToken } from '../services/googleAuth';

export const initializeGAPIClient = async () => {
  try {
    await gapi.client.init({
      apiKey: "AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho", 
      clientId: "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com", 
      scope: "https://www.googleapis.com/auth/calendar",
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    });

    console.log('GAPI client initialized');
  } catch (error) {
    console.error('Error initializing GAPI client:', error);
    throw error;
  }
};

export const getGoogleCalendarEvents = async (startDate, endDate) => {
  try {
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

export const createGoogleCalendarEvent = async (selectedBlocks, users, availableUserIds) => {
  try {
    await refreshGoogleToken();  

    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    if (!user.isSignedIn()) {
      alert("Please sign in with Google first!");
      return;
    }

    console.log("📅 Creating events for selected time slots:", selectedBlocks);
    console.log("✅ Available user IDs:", availableUserIds);

    if (!Array.isArray(availableUserIds)) {
      console.error("❌ availableUserIds is not an array:", availableUserIds);
      return;
    }

    const attendees = availableUserIds
      .filter(userId => users[userId])  
      .map(userId => ({ email: users[userId] }));  

    console.log("📩 Attendees list before sending:", attendees);

    if (attendees.length === 0) {
      console.error("❌ No valid attendees found. Event not created.");
      alert("No valid Google Calendar accounts found for scheduling.");
      return;
    }

    for (const block of selectedBlocks) {
      const eventStartISO = formatDateTime(block);
      const eventStart = new Date(eventStartISO);
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventStart.getMinutes() + 30);

      const event = {
        summary: "Group Meeting",
        description: "Auto-scheduled meeting from Group Availability App",
        start: { dateTime: eventStart.toISOString(), timeZone: "America/Chicago" },
        end: { dateTime: eventEnd.toISOString(), timeZone: "America/Chicago" },
        attendees: attendees,  
      };

      console.log(`📅 Creating event in primary calendar of user: ${user.getBasicProfile().getEmail()}`);

      try {
        const response = await gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
          sendUpdates: "all", 
        });

        if (response.result && response.result.id) {
          console.log(`✅ Event successfully created:`, response.result);
          console.log("📅 Event Title:", response.result.summary);
          console.log("📧 Attendees:", response.result.attendees);
          console.log("🗓 Start Time:", response.result.start.dateTime);
          console.log("🕰 End Time:", response.result.end.dateTime);
          console.log("🔗 Google Calendar Link:", response.result.htmlLink);
        } else {
          console.error(`❌ Failed to create event.`);
        }
      } catch (error) {
        console.error(`❌ Error creating event:`, error);
      }
    }

    alert("📅 Meetings successfully scheduled on Google Calendar!");
  } catch (error) {
    console.error("❌ Google Calendar API Error:", error);
    alert(`Failed to create event: ${error.message || error}`);
  }
};

