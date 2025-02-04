import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import Draggable from 'react-draggable';
import Button from '@mui/material/Button';
import { handleAuth } from '../services/googleAuth';  // Adjust the path if needed

// import { createGoogleCalendarEvent } from '../services/googleCalender';


import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';

const buttonTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#23B76F',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Nunito',
  },
});

// Converts a block string (e.g., "2025-02-04 1 PM:00") into a Date object in America/Chicago time.
// Adjust the logic if your block string format differs.
function convertBlockToDate(block) {
  // Split the block string into parts.
  // Expected format: "YYYY-MM-DD H PM:MM"
  const parts = block.split(" ");
  const dateStr = parts[0];            // e.g., "2025-02-04"
  const hourStr = parts[1];            // e.g., "1"
  // parts[2] contains "PM:00" (or "AM:00"); split that further.
  const [period, minuteStr] = parts[2].split(":");  // period e.g., "PM", minuteStr e.g., "00"

  let hour = parseInt(hourStr, 10);
  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }
  // Create a Date using the America/Chicago offset (standard time assumed as -06:00).
  // (Note: You may need to adjust for daylight saving time if necessary.)
  return new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:${minuteStr}:00-06:00`);
}

// Formats a Date object into the Google Calendar deep link format: YYYYMMDDTHHmmSSZ
function formatDeepLinkDate(date) {
  // Use the ISO string, remove dashes, colons, and fractional seconds.
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Builds the deep link URL and opens it in a new tab.
function scheduleEventDeepLink(selectedBlock, durationMinutes, eventDetails, attendeeEmails) {
  // Convert the selected block to a start Date.
  const startDate = convertBlockToDate(selectedBlock);
  // Calculate the event end date.
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  // Format both dates.
  const startDeep = formatDeepLinkDate(startDate);
  const endDeep = formatDeepLinkDate(endDate);
  
  // Build the base URL.
  const baseUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit';
  // Construct query parameters:
  // - text: event title
  // - dates: start/end in deep link format separated by a slash
  // - details: event description
  // - ctz: time zone identifier (America/Chicago)
  // - add: comma-separated list of attendee emails
  const params = new URLSearchParams({
    text: eventDetails.title,
    dates: `${startDeep}/${endDeep}`,
    details: eventDetails.description,
    ctz: 'America/Chicago',
    add: attendeeEmails.join(','),
  });
  console.log("params: ", params.dates);
  const deepLinkUrl = `${baseUrl}?${params.toString()}`;
  console.log("deepLinkUrl: ", deepLinkUrl);
  // Open the deep link URL in a new browser tab.
  window.open(deepLinkUrl, '_blank');
}

// Convert "YYYY-MM-DD" to Date
function dateParse(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function makeSlotKey(date, hourLabel, isHalfHour = false) {
  const iso = date.toISOString().split('T')[0];
  const minutes = isHalfHour ? '30' : '00';
  return `${iso} ${hourLabel}:${minutes}`;
}

// function to get the color of the cell based on the availability
function getSlotColor(date, hourIndex, groupAvailabilityData) {
  const iso = date.toISOString().split('T')[0];

  if (!groupAvailabilityData) {
    return 'bg-white';
  }

  const slots = groupAvailabilityData[iso];
  if (!slots) {
    return 'bg-white';
  }

  const numMembers = groupAvailabilityData.numMembers;
  const slotVal = slots[hourIndex];
  const pctAvail = slotVal / numMembers;

  switch(true) {
    case pctAvail === 1:
      return 'bg-scale-4';
    case pctAvail >= 0.75:
      return 'bg-scale-3';
    case pctAvail >= 0.4:
      return 'bg-scale-2';
    // case pctAvail >= 0.2:
    //   return 'bg-scale-1';
    default:
      return 'bg-scale-none';
  }
}

function GroupSchedule({ groupData, groupAvailabilityData, startTime, endTime, startDate, endDate, eventName, isAuthenticated, setIsAuthenticated, userId, setUserId }) {
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [lockedDate, setLockedDate] = useState(null);
  const numMembers = groupData?.participants.length || 0;

  // Generate all dates in range
  const getDatesInRange = (start, end) => {
    const dates = [];
    const curr = dateParse(start);
    const last = dateParse(end);
    while (curr <= last) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };
  const dates = getDatesInRange(startDate, endDate);

  // Generate hour labels
  const hourLabels = [];
  for (let hour = startTime; hour <= endTime; hour++) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    hourLabels.push(`${displayHour} ${ampm}`);
  }

  // Mouse Handlers updated for 30-min increments
  const handleMouseDown = (date, hourLabel, isHalfHour) => {
    setIsMouseDown(true);
    setShowPopup(false);
    setLockedDate(date);
    
    const slotKey = makeSlotKey(date, hourLabel, isHalfHour);
    const newSet = new Set();
    
    if (!selectedBlocks.has(slotKey)) {
      newSet.add(slotKey);
    }
    setSelectedBlocks(newSet);
  };

  const handleMouseEnter = (date, hourLabel, isHalfHour) => {
    if (!isMouseDown || !lockedDate) return;
    if (date.toDateString() !== lockedDate.toDateString()) return; // if this cell date differs from the locked date, ignore
    
    const slotKey = makeSlotKey(date, hourLabel, isHalfHour);
    setSelectedBlocks(prev => {
      const updated = new Set(prev);
      if (updated.size === 0) {
        updated.delete(slotKey);
      } else {
        updated.add(slotKey);
      }
      return updated;
    });
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setLockedDate(null);
    // Show the pop-up if we have any selections
    if (selectedBlocks.size > 0) {
      setShowPopup(true);
    }
  };

  // Grid Layout
  const columns = 1 + dates.length; // one col for hour labels, plus one for each date
  const rows = 1 + hourLabels.length; // one header row, plus one for each hour

  // Format for convenience

  return (
    <div 
      className="relative"
      onMouseLeave={() => {
        // If user drags out of the table, treat as mouse up
        if (isMouseDown) handleMouseUp();
      }}
      onMouseUp={() => {
        if (isMouseDown) handleMouseUp();
      }}
    >
      {/* The main grid */}
      <div
        className="w-full select-none" 
        style={{
          display: 'grid',
          gridTemplateColumns: `15% repeat(${dates.length}, 1fr)`,
          gridTemplateRows: `auto repeat(${(hourLabels.length) * 2}, minmax(24px, 1fr))`,
          borderRadius: 8,
          userSelect: 'none'
        }}
      >
        {/* Top-left blank cell */}
        <div />
        {/* Header row: date columns */}
        {/* Header row with date labels */}
        {dates.map((date, i) => {
          const dayName = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
          }).format(date);
          const dayNum = date.getDate();
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center border-l border-gray-200"
            >
              <span className="text-sm">{dayName}</span>
              <span className="text-sm">{dayNum}</span>
            </div>
          );
        })}

        {/* Rows for each hour */}
        {hourLabels.map((hourLabel, hourIndex) => (
          <React.Fragment key={hourIndex}>
            {/* Hour label column */}
            <div className="flex items-center justify-center bg-neutral-100 border-t border-gray-200 row-span-2">
              {hourLabel}
            </div>
            
            {/* Full hour row */}
            {dates.map((date, dateIndex) => {
              const slotKey = makeSlotKey(date, hourLabel, false);
              const isSelected = selectedBlocks.has(slotKey);
              return (
                <div
                  key={`${dateIndex}-full`}
                  onMouseDown={() => handleMouseDown(date, hourLabel, false)}
                  onMouseEnter={() => handleMouseEnter(date, hourLabel, false)}
                  className={`
                    border-t border-l border-gray-200
                    ${isSelected ? 'bg-green-200' : getSlotColor(date, hourIndex * 2, groupAvailabilityData)}
                    hover:bg-green-50
                  `}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
            
            {/* Half hour row */}
            {dates.map((date, dateIndex) => {
              const slotKey = makeSlotKey(date, hourLabel, true);
              const isSelected = selectedBlocks.has(slotKey);
              return (
                <div
                  key={`${dateIndex}-half`}
                  onMouseDown={() => handleMouseDown(date, hourLabel, true)}
                  onMouseEnter={() => handleMouseEnter(date, hourLabel, true)}
                  className={`
                    border-l border-gray-200 border-t border-dashed
                    ${isSelected ? 'bg-green-200' : getSlotColor(date, hourIndex * 2 + 1, groupAvailabilityData)}
                    hover:bg-green-50
                  `}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Pop-up in bottom-right (or wherever you like) */}
      {showPopup && selectedBlocks.size > 0 && (
        <PopupCard 
          selectedBlocks={[...selectedBlocks]} 
          onClose={() => setShowPopup(false)}
          groupAvailabilityData={groupAvailabilityData}
          numMembers={numMembers}
          eventName={eventName}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          userId={userId}
          setUserId={setUserId}
        />
      )}
    </div>
  );
}

function PopupCard({ selectedBlocks, onClose, groupAvailabilityData, numMembers, eventName, isAuthenticated, setIsAuthenticated, userId, setUserId}) {
  const [users, setUsers] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [availabilityCounts, setAvailabilityCounts] = useState({});
  // Extract available user IDs for the selected time slots
  const availableUserIds = memberData.filter(member => 
    selectedBlocks.some(block => {
      const [dateStr] = block.split(" "); // Extract the date part
      return member.availability[dateStr] && member.availability[dateStr].data.includes(1);
    })
  ).map(member => member.id);

  useEffect(() => {
    if (Object.keys(users).length > 0) {
      console.log("✅ Users data is now available:", users);
    }
  }, [users]);
  
  const handleConfirmSelection = async () => {
    const isAuthenticated = localStorage.getItem('google-auth') === 'true';
  
    if (!isAuthenticated) {
      alert("Please sign in with Google first!");
      return;
    }
  
    // Proceed with scheduling after confirming the user is signed in
    const sortedBlocks = Array.from(selectedBlocks).sort((a, b) => convertBlockToDate(a) - convertBlockToDate(b));
    const startBlock = sortedBlocks[0];
    const endBlock = sortedBlocks[sortedBlocks.length - 1];
    const startDateObj = convertBlockToDate(startBlock);
    const endDateObj = new Date(convertBlockToDate(endBlock).getTime() + 30 * 60000);
  
    const durationMinutes = (endDateObj - startDateObj) / 60000;
  
    const eventDetails = {
      title: eventName || "Group Meeting",
      description: "\n\nThis event was scheduled with SyncUp"
    };
  
    const attendeeEmails = availableUserIds.filter(id => users[id]).map(id => users[id]);
  
    scheduleEventDeepLink(startBlock, durationMinutes, eventDetails, attendeeEmails);
  };
  

  // const handleConfirmSelection = async () => {
  //   if (!gapi.auth2) {
  //     alert("Google API is not initialized. Please refresh and sign in again.");
  //     return;
  //   }
    
  //   const authInstance = gapi.auth2.getAuthInstance();
  //   const isSignedIn = authInstance?.isSignedIn?.get();
    
  //   if (!isSignedIn) {
  //     // User is not signed in, so handle sign-in with both state setters
  //     try {
  //       const user = await handleAuth(setIsAuthenticated, setUserId);  // Pass both here
  //       console.log('User authenticated:', user);
  //     } catch (error) {
  //       console.error('Authentication failed:', error);
  //       alert('Failed to sign in. Please try again.');
  //       return;
  //     }
  //   }
    
  //   // Proceed with scheduling after successful authentication
  //   const sortedBlocks = Array.from(selectedBlocks).sort((a, b) => convertBlockToDate(a) - convertBlockToDate(b));
  //   const startBlock = sortedBlocks[0];
  //   const endBlock = sortedBlocks[sortedBlocks.length - 1];
  //   const startDateObj = convertBlockToDate(startBlock);
  //   const endDateObj = new Date(convertBlockToDate(endBlock).getTime() + 30 * 60000);
    
  //   const durationMinutes = (endDateObj - startDateObj) / 60000;
    
  //   const eventDetails = {
  //     title: eventName || "Group Meeting",
  //     description: "\n\nThis event was scheduled with SyncUp"
  //   };
    
  //   const attendeeEmails = availableUserIds.filter(id => users[id]).map(id => users[id]);
    
  //   scheduleEventDeepLink(startBlock, durationMinutes, eventDetails, attendeeEmails);
  // };
  
  // const handleConfirmSelection = async () => {
  //   console.log("Confirming selection:", selectedBlocks);
  //   console.log("Available User IDs:", availableUserIds);
    
  //   if (!gapi.auth2) {
  //     alert("Google API is not initialized. Please refresh and sign in again.");
  //     return;
  //   }
    
  //   const authInstance = gapi.auth2.getAuthInstance();
  //   const isSignedIn = authInstance?.isSignedIn?.get();
  //   if (!isSignedIn) {
  //     alert("Please sign in with Google first!");
  //     return;
  //   }
    
  //   // Compute the start and end times based on selected blocks.
  //   // Assume each block represents a 30-minute slot.
  //   const sortedBlocks = Array.from(selectedBlocks).sort((a, b) => {
  //     // You can sort by converting to Date objects.
  //     return convertBlockToDate(a) - convertBlockToDate(b);
  //   });
    
  //   const startBlock = sortedBlocks[0];
  //   const endBlock = sortedBlocks[sortedBlocks.length - 1];
    
  //   // Convert blocks to Date objects.
  //   const startDateObj = convertBlockToDate(startBlock);
  //   const endDateObj = convertBlockToDate(endBlock);
  //   // Add one block's duration (30 minutes) to the last block to get the true end time.
  //   const trueEndDateObj = new Date(endDateObj.getTime() + 30 * 60000);
    
  //   // Compute duration in minutes.
  //   const durationMinutes = (trueEndDateObj.getTime() - startDateObj.getTime()) / 60000;
    
  //   // Define the event details using the passed eventName.
  //   const eventDetails = {
  //     title: eventName || "Group Meeting",
  //     description: "\n\nThis event was scheduled with SyncUp"
  //   };
    
  //   // Build the attendee email list.
  //   const attendeeEmails = availableUserIds
  //     .filter(id => users[id])  // Ensure the email exists.
  //     .map(id => users[id]);
    
  //   // Now call the deep link helper using the earliest selected block and computed duration.
  //   scheduleEventDeepLink(startBlock, durationMinutes, eventDetails, attendeeEmails);
    
  //   // Optionally, update the UI or close the popup.
  // };
  
  

  useEffect(() => {
    console.log("Selected Blocks:", selectedBlocks);
    const fetchData = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const userData = {};
        usersSnapshot.docs.forEach((doc) => {
          userData[doc.id] = doc.data().email;
        });
        setUsers(userData);

        const availabilityRef = collection(db, "availability");
        const availabilitySnapshot = await getDocs(availabilityRef);
        const members = availabilitySnapshot.docs.map(doc => ({
          id: doc.id,
          availability: doc.data()
        }));
        // console.log("availability: ", members[availability]);
        console.log("members are: ", members);
        setMemberData(members);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Count availability for each block
    const countAvailability = () => {
      // console.log("Counting availability for:", selectedBlocks);
    
      const counts = {};
      selectedBlocks.forEach(block => {
        const [dateStr, hour, ampmMinutes] = block.split(' ');
        const isoDate = dateStr;
    
        const totalMinutes = (parseInt(hour) % 12 + (block.includes('PM') ? 12 : 0)) * 60 + (ampmMinutes.includes(':30') ? 30 : 0);
        const hourIndex = (totalMinutes - 480) / 30;
    
        counts[block] = groupAvailabilityData[isoDate]?.[hourIndex] || 0;
      });
    
      setAvailabilityCounts(counts);
    };
    

    countAvailability();
  }, [selectedBlocks, groupAvailabilityData]);

  const blocks = selectedBlocks.map(block => {
    const [dateStr, hour, ampmMinutes] = block.split(' ');
    const [_, minutes] = ampmMinutes.split(':');
    const formattedTime = `${hour}:${minutes}`;
    const date = new Date(dateStr + 'T12:00:00');
    return { date, time: formattedTime, block };
  });

  const uniqueDates = [...new Set(blocks.map(b => b.date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })))];

  const dateDisplay = uniqueDates.join(', ');

  const times = blocks.map(b => b.time);
  const lastTime = times[times.length - 1];
  const [lastHour, lastMinutes] = lastTime.split(':').map(Number);
  let endHour = lastHour;
  let endMinutes = lastMinutes + 30;

  if (endMinutes >= 60) {
    endHour += 1;
    endMinutes -= 60;
  }

  const endTime = `${endHour}:${endMinutes === 0 ? '00' : endMinutes}`;
  const timeDisplay = `${times[0]} - ${endTime}`;
  const minAvailability = Math.min(...Object.values(availabilityCounts));
  
  return (
    <Draggable 
      handle="#draggable-header"
      defaultPosition={{x: 0, y: 0}}
    >
      <div className="flex flex-col w-fit bg-white rounded-[20px] absolute bottom-5 right-5 shadow-2xl z-50 border border-gray-200 min-w-[400px]">
        <div id="draggable-header" className="pt-2 pr-2 pb-4 bg-green-600 rounded-t-[20px] cursor-move">
          <div className="flex justify-end">
            <ThemeProvider theme={buttonTheme}>
              <IconButton 
                color="primary" 
                aria-label="close" 
                onClick={onClose} 
                className="text-white hover:bg-green-500"
              >
                <CloseIcon />
              </IconButton>
            </ThemeProvider>
          </div>
          <div className="flex justify-center -mt-6">
            <Logo color='text-white' size='24pt'/>
          </div>
        </div>

        <div className="flex items-center p-8 flex-col gap-4 text-neutral-1000">
          <div className="flex items-center gap-3">
            <EventRoundedIcon className="text-neutral-1000" />
            <span>{dateDisplay}</span>
          </div>
          <div className="flex items-center gap-3">
            <AccessTimeRoundedIcon className="text-neutral-1000" />
            <span>{timeDisplay}</span>
          </div>
          <div className="flex items-center gap-3">
            <GroupsRoundedIcon className="text-neutral-1000" />
            <span>{minAvailability} teammate(s) available</span>
          </div>
          {/* Add count for each member */}
          <div className="flex flex-col w-full">
            <h3 className="text-lg font-bold mb-2">Selected Time Slots</h3>
            <ul className="text-sm text-neutral-800">
              {blocks.map(({ block, time }) => (
                <li key={block} className="flex justify-between">
                  <span>{time}</span>
                  <span>{availabilityCounts[block]} / {numMembers} available</span>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="contained" color="primary" size="large" onClick={handleConfirmSelection}>
            Confirm Selection
          </Button>
        </div>
      </div>
    </Draggable>
  );
}

// for week toggler
function formatYyyyMmDd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function GroupAvailability({ groupData, groupAvailabilityData, startDate, endDate, startTime, endTime, eventName}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null); 

  console.log("Event Name:", eventName);
  const [weekStart, setWeekStart] = useState(() => new Date(startDate));
  const [weekEnd, setWeekEnd] = useState(() => new Date(endDate));

  const handlePreviousWeek = () => {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
    setWeekEnd(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };
  
  const handleNextWeek = () => {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
    setWeekEnd(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };


  return (
    <div className="flex flex-col bg-white px-8 py-8 gap-2 rounded-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
      <div className="mb-4 flex items-center justify-between mb-2 -mt-4">
      <button 
          onClick={handlePreviousWeek} 
          className="px-3 py-1 border rounded text-sm"
        >
          &lt; 
        </button>
        <h2 className="text-xl">Group Availability</h2>
        <button 
          onClick={handleNextWeek} 
          className="px-3 py-1 border rounded text-sm"
        >
          &gt;
        </button>
      </div>

      <GroupSchedule
        groupData={groupData}
        groupAvailabilityData={groupAvailabilityData}
        startTime={startTime}
        endTime={endTime}
        startDate={formatYyyyMmDd(weekStart)}
        endDate={formatYyyyMmDd(weekEnd)}
        eventName={eventName} 
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        userId={userId}
        setUserId={setUserId}
      />
    </div>
  );
}
