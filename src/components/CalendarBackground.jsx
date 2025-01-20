import React from "react";

function dateParse(dateString) {
  const dateArray = dateString.split("-");
  const year = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10) - 1; // Month is 0-based in JavaScript
  const date = parseInt(dateArray[2], 10);

  return new Date(year, month, date);
}

const TimeSchedule = ({ startTime, endTime, startDate, endDate }) => {
  // Function to generate date range
  const generateDateRange = (startDate, endDate) => {
    const start = dateParse(startDate);
    const end = dateParse(endDate);

    const dates = [];
    const days = [];

    while (start <= end) {
      dates.push(new Date(start)); // Push the full date object for later use
      days.push(
        new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(start)
      );
      start.setDate(start.getDate() + 1);
    }

    return { dates, days };
  };

  const { dates } = generateDateRange(startDate, endDate);

  // Function to format time (e.g., 9 AM, 10 PM)
  const formatTime = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  // Generate an array of times from startTime to endTime
  const times = [];
  for (let hour = startTime; hour <= endTime; hour++) {
    times.push(formatTime(hour));
  }

    const dateColumnWidth = `${(100 / (dates.length))}%`; // Include the time column

  return (
    <div className="w-full flex flex-col mt-8 border-neutral-400 rounded-lg">
      {/* Header row */}
      <div className="w-full flex">
        <div className="w-[10%] py-4 text-center border-neutral-400"></div>

        {/* Date Columns Header */}
        {dates.map((date, index) => {
          const day = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
          }).format(date);
          const formattedDate = new Intl.DateTimeFormat("en-US", {
            day: "numeric",
          }).format(date);

          // Check if the day is a weekend (Saturday or Sunday)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div
              key={index}
              style={{ width: dateColumnWidth }}
              className={`py-4 text-center border-neutral-400 bg-neutral-100`}
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
            className="w-[10%] text-nowrap bg-neutral-100">
          {times.map((time, index) => (
            <div
              key={index}
              className="border-neutral-400 h-12 flex items-center justify-center"
            >
              <p className="text-sm text-neutral-800">{time}</p>
            </div>
          ))}
        </div>

        {/* Date Columns Body */}
        {dates.map((date, index) => {
          // Check if the day is a weekend
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div
              key={index}
                style={{ width: dateColumnWidth }}
              className={` bg-neutral-100 `}
            >
              {times.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-12 ${
                    idx !== times.length - 1 ? "border-b" : ""
                  } ${
                    index !== dates.length - 1 ? "border-r" : ""
                  } border-neutral-300`}
                ></div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSchedule;
