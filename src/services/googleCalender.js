export const initializeGAPIClient = async () => {
    try {
      await gapi.client.init({
        apiKey: "AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho", // Replace with your actual API key
        clientId: "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com", // Replace with your actual client ID
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
      // Ensure we have valid Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set start time to beginning of day (00:00:00)
      start.setHours(0, 0, 0, 0);
      
      // Set end time to end of day (23:59:59)
      end.setHours(23, 59, 59, 999);

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      const events = response.result.items;
      console.log('Fetched events:', events);
      return events;
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  };