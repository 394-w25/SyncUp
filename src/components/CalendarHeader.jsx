// src/components/calendar/CalendarHeader.jsx
import React from 'react';

const CalendarHeader = () => {
  const currentMonth = "January 2025";
  const dates = ["12", "13", "14", "15", "16", "17", "18"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-[70%] h-[25%]">
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
  // return (
  //   <div className="bg-emerald-50 shadow-lg rounded-lg border border-emerald-200 w-full p-4">
  //     {/* First row - SyncUp */}
  //     <div className="text-center mb-4 bg-emerald-100 rounded-md py-2">
  //       <span className="text-emerald-600 font-semibold text-xl">SyncUp!</span>
  //     </div>

  //     {/* Second row - Month */}
  //     <div className="text-center mb-4 bg-emerald-100 rounded-md py-2">
  //       <h2 className="text-gray-900 font-medium">{currentMonth}</h2>
  //     </div>

  //     {/* Third row - Days and Dates */}
  //     <div className="bg-emerald-100 rounded-md p-4">
  //       <div className="grid grid-cols-7 gap-2 text-sm">
  //         {days.map((day, index) => (
  //           <div key={day} className="text-center">
  //             <div className="mb-2 text-gray-600 font-medium">{day}</div>
  //             <div className={`
  //               ${dates[index] === "12" ? "bg-emerald-600 text-white" : "text-gray-900"}
  //               rounded-full w-8 h-8 flex items-center justify-center mx-auto
  //               hover:bg-emerald-200 cursor-pointer transition-colors
  //             `}>
  //               {dates[index]}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default CalendarHeader;