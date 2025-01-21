import React, { useState } from 'react';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import TimeSchedule from './CalendarEvents';
import { importEvents } from '../utils/importEvents';
import { calculateAvailability } from '../utils/availability';

const buttonTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#116b3c',
      light: '#23da7a',
      dark: '#0c4f2c',
    },
    secondary: {
      main: '#4a4a4a',
      light: '#606060',
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

const CustomShape = ({ fillColor, outsideColor }) => {
  const shapeStyles = { bgcolor: fillColor, width: 30, height: 30 };
  const shapeCircleStyles = { borderRadius: '50%', border: `2px solid ${outsideColor}` };
  
  return (
    <Box component="span" sx={{ ...shapeStyles, ...shapeCircleStyles }} />
  );
};

function dateParse(dateString) {
  const dateArray = dateString.split("-");
  const year = parseInt(dateArray[0], 10);
  const month = parseInt(dateArray[1], 10) - 1; // Month is 0-based in JavaScript
  const date = parseInt(dateArray[2], 10);
  
  return new Date(year, month, date);
}

const Calendar = ({ 
  isAuthenticated, 
  handleAuth, 
  startDate, 
  endDate,
  startTime,
  endTime,
  userId
}) => {
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImportEvents = async () => {
    try {
      setIsLoading(true);
      console.log('Importing events for user ID:', userId);
      if (!userId) {
        throw new Error('User ID is null or undefined');
      }
      const events = await importEvents(userId, startDate, endDate);
      setEvents(events);
      const availability = calculateAvailability(events);
      setAvailability(availability);
    } catch (error) {
      console.error('Error importing events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDateRange = (startDate, endDate) => {
    
    const start = dateParse(startDate);
    const end = dateParse(endDate);

    const dates = [];
    const days = [];

    while (start <= end) {
      dates.push(start.getDate());
      // console.log(dates)
      days.push(
        new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(start)
      );
      start.setDate(start.getDate() + 1);
    }

    return { dates, days };
  };

  const { dates, days } = generateDateRange(startDate, endDate);
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    new Date(startDate)
  );
  const currentYear = new Date(startDate).getFullYear();


  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex flex-col bg-white px-8 py-8 gap-2 rounded-bl-[20px] rounded-br-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
        
        <div className='month-header flex items-center gap-4'>
          <span className='text-green-800 font-nunito font-bold text-[32pt]'>{currentMonth}</span>
          <p className='text-green-800 font-nunito text-[32pt]'>{currentYear}</p>
        </div>

        <div className='row-button flex justify-between'>
          {!isAuthenticated ? (
            <ThemeProvider theme={buttonTheme}>
              <Button 
              variant='outlined' 
              color='secondary'
              onClick={handleAuth}
              style={{textTransform: 'none'}}
              startIcon={<SystemUpdateAltIcon />}>
                Sign in with Google
              </Button>
            </ThemeProvider>
          ) : (
            <ThemeProvider theme={buttonTheme}>
              <Button 
              variant='outlined' 
              color='secondary'
              onClick={handleImportEvents}
              disabled={isLoading}
              style={{textTransform: 'none'}}
              startIcon={<SystemUpdateAltIcon />}>
                {isLoading ? 'Importing...' : 'Import Events'}
              </Button>
            </ThemeProvider>
          )}

          <div className='flex gap-8'>
            <div className='flex gap-2 items-center'>
              <CustomShape fillColor="#E8E8E8" outsideColor="#333333"/>
              <p>Your events</p>
            </div>
            <div className='flex gap-2 items-center'>
              <CustomShape fillColor="#B1CCFA" outsideColor="#083684"/>
              <p>Your availability</p>
            </div>
          </div>
        </div>

        <TimeSchedule 
          startTime={startTime} 
          endTime={endTime} 
          startDate={startDate} 
          endDate={endDate}
          events={events}
        />

      </div>
    </div>
  )
};

export default Calendar;

