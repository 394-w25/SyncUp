import { getUsersEmails } from '../firebase';


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

    const formattedTime = `${hour.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
    const dateTimeStr = `${dateStr}T${formattedTime}`;

    const dateObj = new Date(dateTimeStr);
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date:", block);
      throw new Error("Invalid date format for Google Calendar event");
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error("Error formatting date:", block, error);
    throw error;
  }
};

export const createGoogleCalendarEvent = async (selectedBlocks, users, availableUserIds) => {
  try {
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    if (!user.isSignedIn()) {
      alert("Please sign in with Google first!");
      return;
    }

    console.log("Creating events for selected time slots:", selectedBlocks);
    console.log("✅ Available user IDs:", availableUserIds);

    // ✅ Ensure availableUserIds is an array
    if (!Array.isArray(availableUserIds)) {
      console.error("❌ availableUserIds is not an array:", availableUserIds);
      return;
    }

    for (const block of selectedBlocks) {
      const eventStartISO = formatDateTime(block);
      const eventStart = new Date(eventStartISO);
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventStart.getMinutes() + 30);

      // ✅ Filter only valid user emails for the available users
      const attendees = availableUserIds
        .map(user => users[user.id]) // ✅ Extract user ID first
        .filter(email => typeof email === "string" && email.includes("@")) // Ensure valid email format
        .map(email => ({ email: email.trim() })); // Trim spaces


      console.log("📩 Attendees list before sending:", attendees);

      if (attendees.length === 0) {
        console.error("❌ No valid attendees found. Event not created.");
        continue;
      }

      const event = {
        summary: "Group Meeting",
        description: "Auto-scheduled meeting from Group Availability App",
        start: { dateTime: eventStart.toISOString(), timeZone: "America/Chicago" },
        end: { dateTime: eventEnd.toISOString(), timeZone: "America/Chicago" },
        attendees: attendees,
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      console.log("✅ Event created successfully:", response);
    }

    alert("📅 Meetings successfully scheduled on Google Calendar!");
  } catch (error) {
    console.error("❌ Error creating Google Calendar event:", error);
  }
};


// export const initializeGAPIClient = async () => {
//     try {
//       await gapi.client.init({
//         apiKey: "AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho", // Replace with your actual API key
//         clientId: "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com", // Replace with your actual client ID
//         scope: "https://www.googleapis.com/auth/calendar",
//         discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
//       });
  
//       console.log('GAPI client initialized');
//     } catch (error) {
//       console.error('Error initializing GAPI client:', error);
//       throw error;
//     }
//   };

  
// export const getGoogleCalendarEvents = async (startDate, endDate) => {
//     try {
//       // Ensure we're working with Date objects and proper timezone handling
//       const start = startDate instanceof Date ? startDate : new Date(startDate);
//       const end = endDate instanceof Date ? endDate : new Date(endDate);
      
//       console.log('Requesting events from Google Calendar:', {
//         timeMin: start.toISOString(),
//         timeMax: end.toISOString(),
//         startDate: start.toLocaleString(),
//         endDate: end.toLocaleString()
//       });

//       const response = await gapi.client.calendar.events.list({
//         calendarId: 'primary',
//         timeMin: start.toISOString(),
//         timeMax: end.toISOString(),
//         maxResults: 100,
//         singleEvents: true,
//         orderBy: 'startTime',
//       });
  
//       const events = response.result.items;
//       console.log(`Fetched ${events.length} events from Google Calendar`);
//       return events;
//     } catch (error) {
//       console.error('Error fetching Google Calendar events:', error);
//       throw error;
//     }
// };

//   const formatDateTime = (block) => {
//     try {
//         // Example input: "2025-01-22 8 AM:30"
//         const [dateStr, hourStr, ampmMinutes] = block.split(" ");
//         const [ampm, minutes] = ampmMinutes.split(":"); // "AM:30" → ["AM", "30"]

//         let hour = parseInt(hourStr, 10);
//         if (ampm === "PM" && hour !== 12) hour += 12; // Convert PM to 24-hour format
//         if (ampm === "AM" && hour === 12) hour = 0; // Midnight edge case

//         // Construct ISO 8601 formatted date string
//         const formattedTime = `${hour.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
//         const dateTimeStr = `${dateStr}T${formattedTime}`;

//         const dateObj = new Date(dateTimeStr);
//         if (isNaN(dateObj.getTime())) {
//             console.error("Invalid date:", block);
//             throw new Error("Invalid date format for Google Calendar event");
//         }

//         return dateObj.toISOString(); // Convert to ISO format
//     } catch (error) {
//         console.error("Error formatting date:", block, error);
//         throw error;
//     }
// };

// export const createGoogleCalendarEvent = async (selectedBlocks, users, memberData) => {
//   try {
//     const user = gapi.auth2.getAuthInstance().currentUser.get();
//     if (!user.isSignedIn()) {
//       alert("Please sign in with Google first!");
//       return;
//     }

//     console.log("Creating events for selected time slots:", selectedBlocks);

//     for (const block of selectedBlocks) {
//       const eventStartISO = formatDateTime(block); // Use helper function
//       const eventStart = new Date(eventStartISO);
//       const eventEnd = new Date(eventStart);
//       eventEnd.setMinutes(eventStart.getMinutes() + 30);

//       // Extract valid emails
//       const attendees = memberData
//         .map(member => users[member.id] || member.id)
//         .filter(email => typeof email === "string" && email.includes("@")) // Ensure valid email format
//         .map(email => ({ email: email.trim() })); // Trim any whitespace

//       console.log("📩 Attendees list before sending:", attendees);

//       if (attendees.length === 0) {
//         console.error("❌ No valid attendees found. Event not created.");
//         continue;
//       }

//       const event = {
//         summary: "Group Meeting",
//         description: "Auto-scheduled meeting from Group Availability App",
//         start: { dateTime: eventStart.toISOString(), timeZone: "America/Chicago" },
//         end: { dateTime: eventEnd.toISOString(), timeZone: "America/Chicago" },
//         attendees: attendees, // Use validated emails
//       };

//       const response = await gapi.client.calendar.events.insert({
//         calendarId: "primary",
//         resource: event,
//       });

//       console.log("✅ Event created successfully:", response);
//     }

//     alert("📅 Meetings successfully scheduled on Google Calendar!");
//   } catch (error) {
//     console.error("❌ Error creating Google Calendar event:", error);
//   }
// };


// // export const createGoogleCalendarEvent = async (selectedBlocks, users, memberData) => {
// //   try {
// //     const user = gapi.auth2.getAuthInstance().currentUser.get();
// //     if (!user.isSignedIn()) {
// //       alert("Please sign in with Google first!");
// //       return;
// //     }

// //     console.log("Creating events for selected time slots:", selectedBlocks);

// //     for (const block of selectedBlocks) {
// //       const [dateStr, hour, ampmMinutes] = block.split(' ');
// //       const [_, minutes] = ampmMinutes.split(':');
// //       const formattedTime = `${hour}:${minutes}`;
      
// //       const eventStart = new Date(`${dateStr}T${formattedTime}:00`);
// //       const eventEnd = new Date(eventStart);
// //       eventEnd.setMinutes(eventStart.getMinutes() + 30);

// //       const event = {
// //         summary: "Group Meeting",
// //         description: "Auto-scheduled meeting from Group Availability App",
// //         start: { dateTime: eventStart.toISOString(), timeZone: "America/Chicago" },
// //         end: { dateTime: eventEnd.toISOString(), timeZone: "America/Chicago" },
// //         attendees: memberData.map(member => ({ email: users[member.id] || member.id })),
// //       };

// //       const response = await gapi.client.calendar.events.insert({
// //         calendarId: "primary",
// //         resource: event,
// //       });

// //       console.log("Event created successfully:", response);
// //     }

// //     alert("Meetings successfully scheduled on Google Calendar!");
// //   } catch (error) {
// //     console.error("Error creating Google Calendar event:", error);
// //   }
// // };
