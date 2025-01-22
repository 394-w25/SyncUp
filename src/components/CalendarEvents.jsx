import React from "react";

function dateParse(dateString) {
  const dateArray = dateString.split("-");
  const year = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10) - 1;
  const date = parseInt(dateArray[2], 10);

  return new Date(year, month, date);
}

const CalendarEvents = ({ startTime, endTime, startDate, endDate, events }) => {
  const generateDateRange = (startDate, endDate) => {
    const start = dateParse(startDate);
    const end = dateParse(endDate);

    const dates = [];
    const days = [];

    while (start <= end) {
      dates.push(new Date(start));
      days.push(
        new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(start)
      );
      start.setDate(start.getDate() + 1);
    }

    return { dates, days };
  };

  const { dates } = generateDateRange(startDate, endDate);

  const formatTime = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  const times = [];
  for (let hour = startTime; hour <= endTime; hour++) {
    times.push(formatTime(hour));
  }

  const renderEvents = (date) => {

    const dayEvents = events?.filter(event => {
      const eventStart = event.start?.dateTime || event.start?.date;
      if (!eventStart) return false;
      
      const eventDate = new Date(eventStart);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });

    return dayEvents?.map((event, index) => {
      const startDateTime = event.start?.dateTime;
      const endDateTime = event.end?.dateTime;
      
      if (!startDateTime || !endDateTime) return null;
      
      const eventStartTime = new Date(startDateTime);
      const eventEndTime = new Date(endDateTime);

      if (eventStartTime.getHours() < startTime || eventStartTime.getHours() >= endTime) return null;
      
      const eventStartHour = eventStartTime.getHours() + (eventStartTime.getMinutes() / 60);
      const eventEndHour = eventEndTime.getHours() + (eventEndTime.getMinutes() / 60);
      const duration = eventEndHour - eventStartHour;
      
      if (duration <= 0) return null;
      
      const pixelsPerHour = 48;
      const topPosition = (eventStartHour - startTime) * pixelsPerHour;
      var height = duration * pixelsPerHour;

      if (eventEndHour > endTime) {
        height = (endTime - eventStartHour) * pixelsPerHour;
      }

      console.log(event.summary, event.start.dateTime, eventStartHour, eventEndHour, height);

      return (
        <div
          key={index}
          className="absolute left-0 right-0 mr-1 rounded bg-neutral-200 border border-neutral-400 border-l-4 p-1 overflow-hidden"
          style={{
            top: `${topPosition}px`,
            height: `${height}px`,
            zIndex: 10
          }}
        >
          <p className="text-xs truncate">{event.summary || event.title}</p>
          <p className="text-xs truncate">{eventStartTime.toLocaleTimeString()}</p>
        </div>
      );
    });
  };

  return (
    <div className="w-full flex flex-col mt-6 ">
      {/* Header row */}
      <div className="w-full flex">
        <div className="w-16 mr-1 py-4 text-center border-neutral-400"></div>

        {/* Date Columns Header */}
        {dates.map((date, index) => {
          const day = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
          }).format(date);
          const formattedDate = new Intl.DateTimeFormat("en-US", {
            day: "numeric",
          }).format(date);

          return (
            <div
              key={index}
              style={{ 
                width: `calc((100% - 4rem) / ${dates.length})`,
                backgroundImage: index !== dates.length - 1 ? 'linear-gradient(to top, #d4d4d4 30%, transparent 30%)' : 'none',
                backgroundSize: '1px 100%',
                backgroundPosition: 'right',
                backgroundRepeat: 'repeat-y'
              }}
              className={`py-4 text-center bg-neutral-100`}
            >
              <h2 className="text-lg text-neutral-800">{day}</h2>
              <p className="text-sm text-neutral-800">{formattedDate}</p>
            </div>
          );
        })}
      </div>

      {/* Body rows */}
      <div className="w-full flex">
        {/* Time Column Body */}
        <div 
          className="w-16 text-nowrap bg-neutral-100 relative mr-1">
          {times.map((time, index) => (
            <div
              key={index}
              className="absolute w-full pr-2"
              style={{ top: `${(index ) * 48}px`, transform: 'translateY(-50%)' }}
            >
              <p className="text-sm text-neutral-800 text-right">{time}</p>
            </div>
          ))}
        </div>

        {/* Date Columns Body */}
        {dates.map((date, index) => (
          <div
            key={index}
            style={{ width: `calc((100% - 4rem) / ${dates.length})` }}
            className="relative bg-neutral-100"
          >
            {times.map((_, idx, arr) => (
              <div
                key={idx}
                className={`h-12 border-t ${
                  index !== dates.length - 1 ? "border-r" : ""
                } ${idx === arr.length - 2 ? "border-b" : ""} border-neutral-300`}
              >
                <div className={`h-6 border-b border-neutral-200 border-dashed`}></div>
              </div>
            )).slice(0, -1)}
            {renderEvents(date)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarEvents;
