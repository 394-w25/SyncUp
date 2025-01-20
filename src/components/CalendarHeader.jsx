// src/components/calendar/CalendarHeader.jsx
import React from 'react';

const CalendarHeader = () => {
  const currentMonth = "January 2025";
  const dates = ["12", "13", "14", "15", "16", "17", "18"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full h-[25%]">
      <div className="w-full h-full bg-white rounded-bl-[20px] rounded-br-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
        <div className='flex flex-col py-7 pr-16 pl-12 gap-4'>
          <span className='text-green-800 font-nunito font-bold text-[32pt]'>{currentMonth}</span>
          <div className='flex justify-between w-full'>
            {days.map((day, index) => (
            <div key={day} className="ml-20 text-center">
              <div className="mb-2 text-neutral-800 text-[14pt]">{day}</div>
                <div className={`
                  text-neutral-800 text-[14pt]
                  rounded-full w-8 h-8 flex items-center justify-center mx-auto
                `}>
                  {dates[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
  )
};

export default CalendarHeader;