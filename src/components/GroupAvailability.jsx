import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AvatarGroup from '@mui/material/AvatarGroup';
import Draggable from 'react-draggable';

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

function GroupSchedule({ startTime, endTime, startDate, endDate }) {
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [groupAvailabilityData, setGroupAvailabilityData] = useState({});
  const [numMembers, setNumMembers] = useState(0);
  const [lockedDate, setLockedDate] = useState(null);

  useEffect(() => {
    async function fetchAvailabilityData() {
      const data = {};
      const querySnapshot = await getDocs(collection(db, "availability"));
      let members = 0;

      querySnapshot.forEach((doc) => {
        members++;
        const docData = doc.data()['availability'];
        for (const date in docData) {
          const slots = docData[date]['data']['data'];
          const compressedSlots = [];
          for (let i = 0; i < slots.length; i += 2) {
            const group = slots.slice(i, i + 2);
            compressedSlots.push(group.every(slot => slot === 1) ? 1 : 0);
          }
          if (date in data) {
            data[date] = data[date].map((num, index) => num + compressedSlots[index]);
          } else {
            data[date] = compressedSlots;
          }
        }
      });

      setGroupAvailabilityData(data);
      setNumMembers(members);
    }

    fetchAvailabilityData();
  }, []);

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

  // function to get the color of the cell based on the availability
function getColor(date, hourIndex) {
  const iso = date.toISOString().split('T')[0];
  const slots = groupAvailabilityData[iso];
  if (slots === undefined) {
    return 'bg-white';
  }
  const slotVal = slots[hourIndex];
  const pctAvail = slotVal / numMembers;

  switch(true) {
    case pctAvail === 1:
      return 'bg-scale-4';
    case pctAvail >= 0.75:
      return 'bg-scale-3';
    case pctAvail >= 0.4:
      return 'bg-scale-2';
    case pctAvail >= 0.2:
      return 'bg-scale-1';
    default:
      return 'bg-scale-none';
  }
}

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
                    ${isSelected ? 'bg-green-200' : getColor(date, hourIndex * 2)}
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
                    ${isSelected ? 'bg-green-200' : getColor(date, hourIndex * 2 + 1)}
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
        />
      )}
    </div>
  );
}

function PopupCard({ selectedBlocks, onClose }) {
  const [users, setUsers] = useState([]);
  const [memberData, setMemberData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const userData = {};
        usersSnapshot.docs.forEach((doc) => {
          userData[doc.id] = doc.data().name;
        });
        setUsers(userData);

        const availabilityRef = collection(db, "availability");
        const availabilitySnapshot = await getDocs(availabilityRef);
        const members = availabilitySnapshot.docs.map(doc => ({
          id: doc.id,
          availability: doc.data().availability
        }));
        setMemberData(members);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const blocks = selectedBlocks.map(block => {
    const [dateStr, hour, ampmMinutes] = block.split(' ');
    const [_, minutes] = ampmMinutes.split(':');
    const formattedTime = `${hour}:${minutes}`;
    const date = new Date(dateStr + 'T12:00:00');
    return { date, time: formattedTime };
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

  return (
    <Draggable 
      handle="#draggable-header"
      defaultPosition={{x: 0, y: 0}}
      // bounds="parent"
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
            <span>{memberData.length} available</span>
          </div>
        </div>
      </div>
    </Draggable>
  );
}

const day = new Date();
const currentDate = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
day.setDate(day.getDate() + 7);
const nextDate = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;

export default function GroupAvailability({startDate, endDate, startTime, endTime}) {
  return (
    <div className="flex flex-col bg-white px-8 py-8 gap-2 rounded-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
      <h2 className="text-2xl mb-4">Group Availability</h2>
      <GroupSchedule
        startTime={startTime}
        endTime={endTime}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
