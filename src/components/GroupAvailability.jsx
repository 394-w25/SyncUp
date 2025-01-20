import React from 'react';

function dateParse(dateString) {
  const dateArray = dateString.split("-");
  const year = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10) - 1; // Month is 0-based in JavaScript
  const date = parseInt(dateArray[2], 10);

  return new Date(year, month, date);
}

const GroupSchedule = ({ startTime, endTime, startDate, endDate }) => {
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

  // Generates an array of hour labels (e.g., 9 AM, 10 PM)
  const hourLabels = [];
  for (let hour = startTime; hour <= endTime; hour++) {
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      hourLabels.push(`${formattedHour} ${period}`);
  }

  // Generate an array of times from startTime to endTime in 15 minute increments
  const times = [];
  for (let hour = startTime; hour < endTime; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      const formattedMinutes = minutes === 0 ? "00" : minutes;
      times.push(`${formattedHour}:${formattedMinutes} ${period}`);
    }
  }
  // Add the last time slot for the endTime
  // times.push(`${endTime % 12 === 0 ? 12 : endTime % 12}:00 ${endTime >= 12 ? "PM" : "AM"}`);

  const dateColumnWidth = `${(100 / (dates.length))}%`; // Include the time column
  const timeSlotHeight = 1.5; // Height of each 15 min time slot in rem

  return (
    <div className="w-full flex flex-col border-neutral-400 rounded-lg">
      {/* Header Row Date Labels */}
      <div className="w-full flex">
        <div className="w-[10%] text-center border-neutral-400"></div> {/* Empty space for time labels */}
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
              style={{ width: dateColumnWidth }}
              className={`text-center border-neutral-400 bg-neutral-100`}
            >
              <h2 className="text-sm text-neutral-800">{day}</h2>
              <p className="text-sm text-neutral-800">{formattedDate}</p>
            </div>
          );
        })}
      </div>

      {/* Body rows */}
      <div className="w-full flex">
        {/* Column Hour Labels */}
        <div 
            className="w-[10%] pr-1 text-nowrap bg-neutral-100 justify-items-end">
          {hourLabels.map((time, index) => (
            <div
              key={index}
              className={`border-neutral-400 h-${timeSlotHeight*4} flex items-center`}
            >
              <p className="text-xs text-neutral-800">{time}</p>
            </div>
          ))}
        </div>
        <div className={`w-full flex mt-${timeSlotHeight*2}`}>
          {/* Date Columns Body */}
          {dates.map((date, index) => {
            return (
              <div
                key={index}
                  style={{ width: dateColumnWidth }}
                className={`bg-neutral-100`}
              >
                {times.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-${timeSlotHeight} bg-scale-3`} // add code to color based on avail
                  ></div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const GroupAvailability = () => {
  return (
    <div className='w-full h-[50%]'>
      <div className="w-full h-full p-3 bg-white rounded-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
          <div className='p-5'>
            <span className='text-2xl'>Group Availability</span>
          </div>
        <GroupSchedule startTime={9} endTime={21} startDate={"2025-01-13"} endDate={"2025-01-19"}/>
      </div>
    </div>
  );
};

export default GroupAvailability;