import React, { useState, useMemo } from "react";

const pixelsPerHour = 48;
const pixelsPer30Min = 24;

export default function CalendarEvents({
  startTime = 8,
  endTime = 18,
  startDate = "2025-01-01",
  endDate = "2025-01-07",
  events = [],
}) {
  const [highlightBlocks, setHighlightBlocks] = useState([]);

  const [dragData, setDragData] = useState({
    isDragging: false,
    startY: 0,
    endY: 0,
    dayIndex: null,
  });

  const { dates } = generateDateRange(startDate, endDate);

  // Create an array of label times (8 AM, 9 AM, etc.)
  const times = [];
  for (let hour = startTime; hour <= endTime; hour++) {
    times.push(formatTime(hour));
  }

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

  // MOUSE HANDLERS
  function handleMouseDown(e, dayIndex) {
    e.preventDefault();
    const containerTop = e.currentTarget.getBoundingClientRect().top;
    const yPos = e.clientY - containerTop;
    setDragData({
      isDragging: true,
      startY: yPos,
      endY: yPos,
      dayIndex,
    });
  }

  function handleMouseMove(e, dayIndex) {
    if (!dragData.isDragging || dragData.dayIndex !== dayIndex) return;
    const containerTop = e.currentTarget.getBoundingClientRect().top;
    const yPos = e.clientY - containerTop;
    setDragData((prev) => ({ ...prev, endY: yPos }));
  }

  function handleMouseUp(e, dayIndex) {
    if (!dragData.isDragging || dragData.dayIndex !== dayIndex) {
      resetDrag();
      return;
    }

    const { startY, endY } = dragData;
    const rawTop = Math.min(startY, endY);
    const rawBottom = Math.max(startY, endY);

    const top = snapTo30Min(rawTop);
    const bottom = snapTo30Min(rawBottom);
    const height = bottom - top;

    // If user dragged a tiny amount, ignore
    if (height < 5) {
      resetDrag();
      return;
    }

    // Check overlap with existing highlight blocks
    const hasOverlapWithUserBlocks = highlightBlocks
      .filter((b) => b.dayIndex === dayIndex)
      .some((b) => {
        const bTop = b.top;
        const bBottom = b.top + b.height;
        // Overlap if there's any intersection
        return top < bBottom && bottom > bTop;
      });

    // Check overlap with Google events
    const hasOverlapWithGcal = googleBlocksByDay[dayIndex]?.some((block) => {
      return top < block.bottom && bottom > block.top;
    });

    if (hasOverlapWithUserBlocks || hasOverlapWithGcal) {
      console.log("Cannot select—overlaps an existing highlight or Gcal event");
      resetDrag();
      return;
    }

    // Otherwise, add the new block
    const newBlock = {
      id: Date.now(),
      dayIndex,
      top,
      height,
    };
    setHighlightBlocks((prev) => [...prev, newBlock]);
    resetDrag();
  }

  function resetDrag() {
    setDragData({ isDragging: false, startY: 0, endY: 0, dayIndex: null });
  }

  // Remove user highlights
  function handleBlockClick(id) {
    setHighlightBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  // RENDER
  return (
    <div className="w-full flex flex-col mt-6">
      {/* HEADER ROW */}
      <div className="w-full flex">
        <div className="w-16 mr-1 py-4 text-center border-neutral-400" />
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
              className="py-4 text-center bg-neutral-100 border-r border-neutral-300 last:border-r-0"
            >
              <h2 className="text-lg text-neutral-800">{dayShort}</h2>
              <p className="text-sm text-neutral-800">{dayNum}</p>
            </div>
          );
        })}
      </div>

      {/* BODY ROWS */}
      <div className="w-full flex">
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
              <div key={i} className="h-12 border-t border-neutral-200 relative">
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
                  onClick={() => handleBlockClick(block.id)}
                  style={{
                    position: "absolute",
                    top: block.top,
                    height: block.height,
                    left: 0,
                    width: "100%",
                    backgroundColor: "#B1CCFA",
                    border: "1px solid #083684",
                    cursor: "pointer",
                    zIndex: 40,
                  }}
                />
              ))}

            {/* 3) EPHEMERAL BLOCK WHILE DRAGGING */}
            {dragData.isDragging && dragData.dayIndex === dayIndex && (
              <DragSelectionBlock dragData={dragData} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Renders Google Calendar events in the day column
function renderEventsForDate(date, events, startTime, endTime) {
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
  const startDate = dateParse(start);
  const endDate = dateParse(end);
  const dates = [];
  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return { dates };
}

function dateParse(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
}
