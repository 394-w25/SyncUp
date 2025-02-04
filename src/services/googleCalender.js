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

// export const createGoogleCalendarEvent = async (selectedBlocks, users, availableUserIds) => {
//   try {
//     // await refreshGoogleToken();

//     const authInstance = gapi.auth2.getAuthInstance();
//     const currentUser = authInstance.currentUser.get();
//     const currentUserEmail = currentUser.getBasicProfile().getEmail();

//     if (!currentUser.isSignedIn()) {
//       alert("Please sign in with Google first! googleCalender");
//       return;
//     }

//     // 过滤出可用的参与者，排除当前用户自己
//     const attendees = availableUserIds
//       // .filter(userId => users[userId] && users[userId] !== currentUserEmail)
//       .map(userId => ({
//         email: users[userId],
//         responseStatus: "needsAction",  // 确保参会者需要响应
//         displayName: users[userId].split('@')[0]  // 添加显示名称（可选）
//       }));


//     console.log("📩 Attendees list before sending:", attendees);

//     if (attendees.length === 0) {
//       console.error("❌ No valid attendees found. Event not created.");
//       alert("No valid Google Calendar accounts found for scheduling.");
//       return;
//     }

//     for (const block of selectedBlocks) {
//       const eventStartISO = formatDateTime(block);
//       const eventStart = new Date(eventStartISO);
//       const eventEnd = new Date(eventStart);
//       eventEnd.setMinutes(eventStart.getMinutes() + 30);

//       const event = {
//         summary: "Group Meeting",
//         description: "Auto-scheduled meeting from Group Availability App",
//         start: { dateTime: eventStart.toISOString(), timeZone: "America/Chicago" },
//         end: { dateTime: eventEnd.toISOString(), timeZone: "America/Chicago" },
//         attendees: attendees,
//         guestsCanInviteOthers: false,   // 参会者不能邀请其他人
//         guestsCanModify: false,        // 参会者不能修改事件
//         guestsCanSeeOtherGuests: true, // 参会者可以看到其他人的邮件
//         reminders: { useDefault: true }
//       };
      

//       // 在当前用户的 Calendar 中创建事件，确保只发送邀请，不改变当前用户的日历视图
//       const response = await gapi.client.calendar.events.insert({
//         calendarId: "primary",
//         resource: event,
//         sendUpdates: "all",          // 发送更新通知
//         sendNotifications: true      // 发送电子邮件通知
//       });
      
      
//       if (response.result && response.result.id) {
//         console.log(`✅ Invitation sent successfully:`, response.result);
//         console.log("📧 Attendees:", response.result.attendees);
//         console.log("📬 Organizer:", response.result.organizer.email);
//         console.log("📅 Event Link:", response.result.htmlLink);

//         // await sendEmailReminder(attendees.map(a => a.email));
//       } else {
//         console.error(`❌ Failed to send invitation.`);
//       }
      
      
//     }

//     alert("📩 Invitations successfully sent to attendees!");
//   } catch (error) {
//     console.error("❌ Google Calendar API Error:", error);
//     alert(`Failed to send invitation: ${error.message || error}`);
//   }
// };