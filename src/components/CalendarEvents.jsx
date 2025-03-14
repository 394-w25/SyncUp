import React, { useState, useMemo, useEffect } from "react";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const pixelsPerHour = 48;
const pixelsPer30Min = 24;

export default function CalendarEvents({
  startTime = 8,
  endTime = 18,
  startDate,
  endDate,
  events = [],
}) {
  
  const [highlightBlocks, setHighlightBlocks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const userId = localStorage.getItem('user-id');

  const [dragData, setDragData] = useState({
    isDragging: false,
    startY: 0,
    endY: 0,
    dayIndex: null,
  });

  const { dates } = generateDateRange(startDate, endDate);

  // useEffect(() => {
  //   if (startDate && endDate && startTime && endTime) {
  //     console.log('CalendarEvents: Received props', {
  //       startDate,
  //       endDate,
  //       startTime,
  //       endTime,
  //       dates,
  //       events
  //     });
  //   }
  // }, [startDate, endDate, startTime, endTime, dates, events]);

  // Create an array of label times (8 AM, 9 AM, etc.)
  const times = [];
  for (let t = startTime; t < endTime; t += 1) {
    times.push(formatTime(t));
  }
  times.push(formatTime(endTime))

  const googleBlocksByDay = useMemo(() => {
    const map = {};
    dates.forEach((date, dayIndex) => {
      const dayEvents = events?.filter((event) => {
        const evStart = event.start?.dateTime || event.start?.date;
        if (!evStart) return false;
        const evDate = new Date(evStart);
        return (
          evDate.getFullYear() === date.getFullYear() &&
          evDate.getMonth() === date.getMonth() &&
          evDate.getDate() === date.getDate()
        );
      });

      // For each event, compute top + bottom in pixels
      const blocks = [];
      dayEvents?.forEach((event) => {
        const startDateTime = event.start?.dateTime;
        const endDateTime = event.end?.dateTime;
        if (!startDateTime || !endDateTime) return;

        const eventStartTime = new Date(startDateTime);
        const eventEndTime = new Date(endDateTime);

        const eventStartHour =
          eventStartTime.getHours() + eventStartTime.getMinutes() / 60;
        const eventEndHour =
          eventEndTime.getHours() + eventEndTime.getMinutes() / 60;

        // If the event is out of range, skip or clamp
        if (eventEndHour <= startTime || eventStartHour >= endTime) {
          return;
        }

        // Adjust if partial overlap
        const visibleStart = Math.max(eventStartHour, startTime);
        const visibleEnd = Math.min(eventEndHour, endTime);

        const top = (visibleStart - startTime) * pixelsPerHour;
        const height = (visibleEnd - visibleStart) * pixelsPerHour;
        const bottom = top + height;

        blocks.push({ top, bottom });
      });

      map[dayIndex] = blocks;
    });
    return map;
  }, [dates, events, startTime, endTime]);

  useEffect(() => {
    if (!userId) return; // If not logged in, skip

    const fetchAvailability = async () => {
      try {
        const docRef = doc(db, "availability", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data(); 
          // data has: { 'YYYY-MM-DD': ... }

          // We'll gather the newly reconstructed blocks here
          const newBlocks = [];

          // Convert startDate string to a Date object for dayIndex calculations
          const startDateObj = new Date(startDate); // e.g. "2025-01-20"

          // Iterate over each date in availability
          for (const [dateString, details] of Object.entries(data)) {
          // Convert the dateString (e.g. "2025-01-22") to a Date object
            const dayDate = new Date(dateString + "T00:00:00");

            // Calculate dayIndex as difference in days from startDate to this date
            const dayIndex = Math.round(
              (dayDate - startDateObj) / (1000 * 60 * 60 * 24)
            );

            // If it's outside your displayed range, optionally skip
            if (dayIndex < 0) continue;

            // Extract the 0/1 slots array
            // details.data.data => your array of 0/1 for the day
            const slotsArray = details?.data || [];

            // Parse consecutive 1's into highlight blocks
            let i = 0;
            while (i < slotsArray.length) {
              if (slotsArray[i] === 1) {
                // found start of a block
                let j = i + 1;
                // move j forward while consecutive 1's
                while (j < slotsArray.length && slotsArray[j] === 1) {
                  j++;
                }
                // Now we have a block from i..(j-1)
                const blockTop = i * 12; // each slot = 15 mins => 12 pixels
                const blockHeight = (j - i) * 12;
                
                newBlocks.push({
                  id: Date.now() + Math.random(), // unique ID
                  dayIndex,
                  top: blockTop,
                  height: blockHeight,
                });
                // jump to j
                i = j;
              } else {
                i++;
              }
            }
          }

          // Finally, set the highlight blocks with the newly loaded data
          setHighlightBlocks(newBlocks);
        }
      } catch (error) {
        console.error("Error fetching user availability:", error);
      }
    };

    fetchAvailability();
  }, [userId, startDate, endDate]);

  const handleSave = async () => {
    if (!userId) {
      alert('Please sign in to save your availability');
      return;
    }

    setIsSaving(true);
    try {
      const availabilityByDate = {};
      
      highlightBlocks.forEach(block => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + block.dayIndex);
        const dateString = date.toISOString().split('T')[0];
        
        if (!availabilityByDate[dateString]) {
          availabilityByDate[dateString] = new Array((endTime - startTime) * 4).fill(0);
        }
        
        const startSlot = Math.floor(block.top / 12);
        const endSlot = Math.floor((block.top + block.height) / 12);
        
        for (let i = startSlot; i < endSlot; i++) {
          if (i < availabilityByDate[dateString].length) {
            availabilityByDate[dateString][i] = 1;
          }
        }
      });
      
      const availabilityDoc = {};

      Object.entries(availabilityByDate).forEach(([date, slots]) => {
        availabilityDoc[date] = {
          startTime: startTime,
          endTime: endTime,
          intervalMins: 15,
          data: slots,
        };
      });
      
      await setDoc(doc(db, "availability", userId), availabilityDoc);
      setHasUnsavedChanges(false);
      // alert('Availability saved successfully!');
    } catch (error) {
      console.error("Error saving availability:", error);
      alert('Failed to save availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // MOUSE HANDLERS
  function handleMouseDown(e, dayIndex) {
    e.preventDefault();
    const container = e.currentTarget;
    const containerTop = container.getBoundingClientRect().top;
    const yPos = e.clientY - containerTop;
    setDragData({
      isDragging: true,
      startY: yPos,
      endY: yPos,
      dayIndex,
      container,
    });
    // Global listeners, capture mouse movements and mouseup even if the cursor leaves the container
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
  }

  // Global mousemove handler to update dragData when cursor leaves the container
  function handleGlobalMouseMove(e) {
    if (!dragData.isDragging || !dragData.container) return;
    const container = dragData.container;
    const containerTop = container.getBoundingClientRect().top;
    const yPos = e.clientY - containerTop;
    setDragData(prev => ({ ...prev, endY: yPos }));
  }

  // Global mouseup handler to process the drag end
  function handleGlobalMouseUp(e) {
    if (!dragData.isDragging || !dragData.container) return;
    const container = dragData.container;
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    let yPos = e.clientY - containerTop;
    // Clamp the y position to the container’s height if the mouse was released below (or above) it
    if (yPos > containerRect.height) {
      yPos = containerRect.height;
    } else if (yPos < 0) {
      yPos = 0;
    }
    // Update the dragData with the clamped value and process the drag end
    setDragData(prev => ({ ...prev, endY: yPos }));
    processDragEnd(dragData.dayIndex, container);
    // Remove global listeners
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    window.removeEventListener('mousemove', handleGlobalMouseMove);
  }

  // Normal mouseup handler
  function handleMouseUp(e, dayIndex) {
    if (!dragData.isDragging || dragData.dayIndex !== dayIndex) {
      resetDrag();
      return;
    }
    processDragEnd(dayIndex, e.currentTarget);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    window.removeEventListener('mousemove', handleGlobalMouseMove);
  }

  // Process drag and create time block
  function processDragEnd(dayIndex, container) {
    if (!dragData.isDragging || dragData.dayIndex !== dayIndex) {
      resetDrag();
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const maxY = containerRect.height;
    const { startY, endY } = dragData;
    const rawTop = Math.min(startY, endY);
    const rawBottom = Math.max(startY, endY);

    const clampedBottom = Math.min(rawBottom, maxY);
    const top = snapTo30Min(rawTop);
    const bottom = snapTo30Min(clampedBottom);
    const height = bottom - top;

    // If the drag is too small, ignore it
    if (height < 5) {
      resetDrag();
      const clickedBlock = highlightBlocks.find((block) => {
        return block.dayIndex === dayIndex && top >= block.top && top <= block.top + block.height;
      });
      if (clickedBlock) {
        handleBlockClick({ stopPropagation: () => {} }, clickedBlock.id);
      }
      return;
    }

    // Check for overlap with existing blocks and Google events
    const hasOverlapWithUserBlocks = highlightBlocks
      .filter((b) => b.dayIndex === dayIndex)
      .some((b) => {
        const bTop = b.top;
        const bBottom = b.top + b.height;
        return top < bBottom && bottom > bTop;
      });

    if (hasOverlapWithUserBlocks) {
      resetDrag();
      return;
    }

    // Save new block
    const newBlock = {
      id: Date.now(),
      dayIndex,
      top,
      height,
    };
    setHighlightBlocks((prev) => [...prev, newBlock]);
    setHasUnsavedChanges(true);
    resetDrag();
  }

  function handleMouseMove(e) {
    if (!dragData.isDragging || !dragData.container) return;
    const container = dragData.container;
    const containerTop = container.getBoundingClientRect().top;
    const yPos = e.clientY - containerTop;
    setDragData(prev => ({ ...prev, endY: yPos }));
  }

  function resetDrag() {
    setDragData({ isDragging: false, startY: 0, endY: 0, dayIndex: null });
  }

  // Remove user highlights
  const handleBlockClick = (e, id) => {
    e.stopPropagation();
    const updatedBlocks = highlightBlocks.filter(block => block.id !== id);
    setHighlightBlocks(updatedBlocks);
    setHasUnsavedChanges(true);
    setIsSaving(false);
  };
  
  const pixelsToTime = (pixels) => {
    const totalMinutes = (pixels / pixelsPerHour) * 60;
    const hour = Math.floor(totalMinutes / 60) + startTime;
    const minutes = Math.floor(totalMinutes % 60);
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isEventVisible = (event, startTime, endTime) => {
    const evStart = event.start?.dateTime || event.start?.date;
    const evEnd = event.end?.dateTime || event.end?.date;
    const startHour = new Date(evStart).getHours();
    const startMinute = new Date(evStart).getMinutes();
    const endHour = new Date(evEnd).getHours();
    const endMinute = new Date(evEnd).getMinutes();

    const start = startHour + startMinute / 60;
    const end = endHour + endMinute / 60;
    return start >= startTime && end <= endTime;
  };

  function renderEventsForDate(date, events, startTime, endTime) {
    const dayEvents = events?.filter((event) => {
      const evStart = event.start?.dateTime || event.start?.date;
      const evEnd = event.end?.dateTime || event.end?.date;
      if (!evStart) return false;
      if (!isEventVisible(event, startTime, endTime)) return false;
      const evDate = new Date(evStart);

      return (
        evDate.getFullYear() === date.getFullYear() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getDate() === date.getDate()
      );
    });

    return dayEvents?.map((event, i) => {
      const startDateTime = event.start?.dateTime;
      const endDateTime = event.end?.dateTime;
      if (!startDateTime || !endDateTime) return null;

      const eventStartTime = new Date(startDateTime);
      const eventEndTime = new Date(endDateTime);
      const eventStartHour =
        eventStartTime.getHours() + eventStartTime.getMinutes() / 60;
      const eventEndHour =
        eventEndTime.getHours() + eventEndTime.getMinutes() / 60;

      // If outside the displayed range, skip or clamp
      if (eventEndHour <= startTime || eventStartHour >= endTime) return null;

      const visibleStart = Math.max(eventStartHour, startTime);
      const visibleEnd = Math.min(eventEndHour, endTime);
      const duration = visibleEnd - visibleStart;
      if (duration <= 0) return null;

      const pixelsPerHour = 48;
      const topPosition = (visibleStart - startTime) * pixelsPerHour;
      const height = duration * pixelsPerHour;

      return (
        <div
          key={i}
          className="absolute left-0 right-0 mr-1 rounded bg-neutral-200 border border-neutral-400 border-l-4 p-1 overflow-hidden"
          style={{
            top: `${topPosition}px`,
            height: `${height}px`,
            zIndex: 10,
          }}
        >
          <p className="text-xs truncate text-neutral-800">
            {event.summary || event.title}
          </p>
          <p className="text-xs truncate text-neutral-600">
            {eventStartTime.toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}{" "}
            -{" "}
            {eventEndTime.toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      );
    });
  };

  

  if (!startDate || !endDate || startTime === undefined || endTime === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col overflow-x-auto scrollbar-visible">
      {/* Header row */}
      <div className="w-full flex min-w-[640px]">
        <div className="w-16 mr-1 py-2 sm:py-4 text-center border-neutral-400" />
        {dates.map((date, idx) => {
          const dayShort = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
          }).format(date);
          const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
            date
          );
          return (
            <div
              key={idx}
              style={{
                width: `calc((100% - 4rem) / ${dates.length})`,
              }}
              className="py-2 sm:py-4 text-center bg-neutral-100 border-r border-neutral-300 last:border-r-0"
            >
              <h2 className="text-sm sm:text-lg text-neutral-800">{dayShort}</h2>
              <p className="text-xs sm:text-sm text-neutral-800">{dayNum}</p>
            </div>
          );
        })}
      </div>

      {/* Body rows with minimum width to prevent squishing */}
      <div className="w-full flex min-w-[640px]">
        {/* TIME COLUMN */}
        <div className="w-16 bg-neutral-100 mr-1 relative">
          {times.map((time, i) => (
            <div
              key={i}
              className="absolute w-full pr-2"
              style={{
                top: `${i * pixelsPerHour}px`,
                transform: "translateY(-50%)",
              }}
            >
              <p className="text-sm text-right">{time}</p>
            </div>
          ))}
        </div>

        {/* DAY COLUMNS */}
        {dates.map((date, dayIndex) => (
          <div
            key={dayIndex}
            className="relative bg-white border-r border-neutral-300 last:border-r-0"
            style={{
              width: `calc((100% - 4rem) / ${dates.length})`,
              height: `${(endTime - startTime) * pixelsPerHour}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, dayIndex)}
            onMouseMove={(e) => handleMouseMove(e, dayIndex)}
            onMouseUp={(e) => handleMouseUp(e, dayIndex)}
          >
            {/* Hour lines */}
            {times.map((_, i) => (
              <div key={i} className="h-12 border-t border-neutral-200 relative last:border-b">
                <div className="h-6 border-b border-neutral-200 border-dashed" />
              </div>
            )).slice(0, -1)}

            {/* 1) RENDER GOOGLE EVENTS */}
            {renderEventsForDate(date, events, startTime, endTime)}

            {/* 2) RENDER EXISTING USER HIGHLIGHT BLOCKS */}
            {highlightBlocks
              .filter((b) => b.dayIndex === dayIndex)
              .map((block) => (
                <div
                  key={block.id}
                  className="absolute mr-1 rounded  border-l-4 p-1 w-full cursor-pointer transition-colors bg-blue-100 border-2 border-blue-500 hover:bg-blue-200"
                  style={{
                    top: `${block.top}px`,
                    height: `${block.height}px`,
                  }}
                  onClick={(e) => handleBlockClick(e, block.id)}
                >
                  <div className="text-xs text-blue-1000 truncate">
                    {formatDisplayTime(block.top, startTime, pixelsPerHour)} - 
                    {formatDisplayTime(block.top + block.height, startTime, pixelsPerHour)}
                  </div>
                </div>
              ))}

            {/* 3) EPHEMERAL BLOCK WHILE DRAGGING */}
            {dragData.isDragging && dragData.dayIndex === dayIndex && (
              <DragSelectionBlock dragData={dragData} />
            )}
          </div>
        ))}
      </div>
      {/* Save Button */}
      <div className="flex justify-end mb-4 mt-8">
        <button
          onClick={async () => {
            await handleSave();
            window.location.reload(); // Refresh the page
          }}
          disabled={isSaving || !hasUnsavedChanges}
          className={`px-4 py-2 rounded-md text-white font-medium
            ${(isSaving || !hasUnsavedChanges)
              ? 'bg-neutral-300 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
            }
          `}
        >
          {isSaving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
}

function DragSelectionBlock({ dragData }) {
  const { startY, endY } = dragData;
  const top = Math.min(startY, endY);
  const height = Math.abs(endY - startY);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "100%",
        height,
        backgroundColor: "#b1ccfab0",
        border: "1px solid #083684b0",
        zIndex: 50,
        borderRadius: "4px",
      }}
    />
  );
}

function snapTo30Min(yPos) {
  const halfHours = yPos / pixelsPer30Min; 
  const rounded = Math.round(halfHours);
  return rounded * pixelsPer30Min;
}

function generateDateRange(start, end) {
  // Create dates at midnight in local timezone
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates = [];
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return { dates };
}

function formatTime(timeValue) {
  const hour = Math.floor(timeValue);
  const minutes = (timeValue % 1) * 60;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinutes = minutes === 0 ? "00" : "30";
  return `${displayHour}:${displayMinutes} ${period}`;
}

function formatDisplayTime(pixels, startTime, pixelsPerHour) {
  const totalMinutes = (pixels / pixelsPerHour) * 60;
  const hour = Math.floor(totalMinutes / 60) + startTime;
  const minutes = Math.floor(totalMinutes % 60);
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
