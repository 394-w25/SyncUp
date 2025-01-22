import React, { useState, useRef } from 'react';
import Logo from './Logo';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';


const groupAvailabilityData = {};   // maps dates to group availability
const querySnapshot = await getDocs(collection(db, "availability"));
let numMembers = 0; // number of members in the group

// Get the availability data for all group members and stores in groupAvailabilityData
querySnapshot.forEach((doc) => {
  numMembers++;
  const data = doc.data()['availability'];

  for (const date in data) {
    const slots = data[date]['data']['data'];

    // Compress the 40-element array into a 10-element array, one element for each hour
    const compressedSlots = [];
    for (let i = 0; i < slots.length; i += 4) {
      const group = slots.slice(i, i + 4);
      compressedSlots.push(group.every(slot => slot === 1) ? 1 : 0);
    }

    // adds the slots to the existing slots for that date if it exists
    if (date in groupAvailabilityData) {
      groupAvailabilityData[date] = groupAvailabilityData[date].map((num, index) => num + compressedSlots[index]);
    }
    else {
      groupAvailabilityData[date] = compressedSlots;
    } 
    groupAvailabilityData[date] = compressedSlots;
  };
});


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
    default:
      return 'bg-white';
  }
}

// Convert "YYYY-MM-DD" to Date
function dateParse(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Represents an individual cell by day+hour
// (Could just store indices, but storing actual data is fine.)
function makeSlotKey(date, hourLabel) {
  // Format date as 2025-01-13 + "9 AM"
  const iso = date.toISOString().split('T')[0];
  return `${iso} ${hourLabel}`;
}

function GroupSchedule({ startTime, endTime, startDate, endDate }) {
  // Keep track of:
  //  1) all selected blocks
  //  2) whether the mouse is down (i.e., user is dragging)
  //  3) whether to show the pop-up
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
  for (let hour = startTime; hour < endTime; hour++) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    hourLabels.push(`${displayHour} ${ampm}`);
  }

  // Mouse Handlers
  const handleMouseDown = (date, hourLabel) => {
    setIsMouseDown(true);
    setShowPopup(false);
    
    const slotKey = makeSlotKey(date, hourLabel);
    const newSet = new Set();
    
    if (!selectedBlocks.has(slotKey)) {
      newSet.add(slotKey);
    }
    setSelectedBlocks(newSet);
  };

  const handleMouseEnter = (date, hourLabel) => {
    if (!isMouseDown) return;
    
    const slotKey = makeSlotKey(date, hourLabel);
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
          gridTemplateRows: `auto repeat(${hourLabels.length}, 1fr)`,
          // border: '1px solid #ccc',
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
            <div className="flex items-center justify-center bg-neutral-100 border-t border-gray-200">
              {hourLabel}
            </div>
            {/* One cell per date */}
            {dates.map((date, dateIndex) => {
              // Unique key for day+hour
              const slotKey = makeSlotKey(date, hourLabel);
              const isSelected = selectedBlocks.has(slotKey);

              return (
                <div
                  key={dateIndex}
                  onMouseDown={() => handleMouseDown(date, hourLabel)}
                  onMouseEnter={() => handleMouseEnter(date, hourLabel)}
                  className={
                    'border-t border-l border-gray-200 ' +
                    (isSelected ? 'bg-green-200' : getColor(date, hourIndex)) +
                    ' hover:bg-green-50'
                  }
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

// Example pop-up component showing *all* selected blocks
function PopupCard({ selectedBlocks, onClose }) {
  console.log(selectedBlocks);
  const blocks = selectedBlocks.map(block => {
    const [dateStr, hour, ampm] = block.split(' ');
    const formattedTime = `${hour}:00 ${ampm}`;
    return { date: new Date(dateStr), time: formattedTime };
  });

  const uniqueDates = [...new Set(blocks.map(b => b.date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })))];

  const dateDisplay = uniqueDates.join(', ');

  const times = blocks.map(b => b.time);
  const timeDisplay = times.length > 1 
    ? `${times[0]} - ${times[times.length - 1]}` 
    : `${times[0].replace(':00', ':00')} - ${times[0].replace(':00', ':59')}`; // Show minutes for single block

  return (
    <div className="flex flex-col w-[28%] bg-white rounded-[20px] fixed bottom-5 right-5 shadow-2xl z-50 border border-gray-200 min-w-[400px]">
      <div className="pt-2 pr-2 pb-4 bg-green-600 rounded-t-[20px]">
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

      {/* <div className="flex justify-between p-8 text-[18px]"> */}
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
            <span>4 people</span>
          </div>
        </div>

        {/* <div className="flex flex-col items-center gap-3 text-[18px]">
          <span className="text-neutral-1000">Schedule now?</span>
          <ThemeProvider theme={buttonTheme}>
            <Button 
              variant="contained" 
              color="secondary"
              style={{
                textTransform: 'none',
                borderRadius: 50,
                color: 'white',
                fontWeight: 'bold',
                padding: '8px 32px',
                fontSize: '16px'
              }}
              onClick={() => alert('Proceed to schedule these time(s)!')}
              endIcon={<ArrowForwardIcon />}
              disableElevation
            >
              Go
            </Button>
          </ThemeProvider>
        </div> */}
      {/* </div> */}
    </div>
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
