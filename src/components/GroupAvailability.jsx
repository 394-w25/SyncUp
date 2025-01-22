import React, { useState, useRef } from 'react';

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
          border: '1px solid #ccc',
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
                    (isSelected ? 'bg-green-200' : 'bg-white') +
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
  // Sort or group blocks if you like, for now just show them all
  // Each entry looks like "2025-01-15 9 AM"
  
  return (
    <div
      className="fixed bottom-5 right-5 w-96 p-4 bg-white shadow-xl rounded-lg z-50 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-lg text-green-700">
          SyncUp!
        </span>
        <button onClick={onClose} className="text-gray-500">✕</button>
      </div>

      <p className="text-sm mb-2">
        You selected <strong>{selectedBlocks.length}</strong> time blocks:
      </p>

      <ul className="max-h-32 overflow-auto list-disc list-inside text-sm mb-3">
        {selectedBlocks.map((block, i) => (
          <li key={i}>{block}</li>
        ))}
      </ul>

      <button
        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 w-full"
        onClick={() => alert('Proceed to schedule these time(s)!')}
      >
        GO →
      </button>
    </div>
  );
}

const day = new Date();
const currentDate = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
day.setDate(day.getDate() + 7);
const nextDate = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;

export default function GroupAvailability({startDate, endDate, startTime, endTime}) {
  return (
    <div className="min-h-screen p-3 bg-gray-50">
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
