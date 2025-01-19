import ApiCalendar from "react-google-calendar-api";



const config = {
    clientId: "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com",
    apiKey: "AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho",
    scope: "https://www.googleapis.com/auth/calendar",
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    ],
  };
  
  const apiCalendar = new ApiCalendar(config);

export default apiCalendar;