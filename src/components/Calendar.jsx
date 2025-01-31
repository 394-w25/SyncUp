import React, { useState } from 'react';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import CalendarEvents from './CalendarEvents';
import { importEvents } from '../utils/importEvents';
import { calculateAvailability } from '../utils/availability';
import { updateIsSynced } from '../services/googleAuth';
import moment from 'moment';
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

const Calendar = ({ 
  isAuthenticated, 
  handleAuth, 
  startDate, 
  endDate,
  startTime = 9,
  endTime = 17,
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
      const availability = calculateAvailability(events, userId);
      setAvailability(availability);
      console.log('updating user isSynced to true');
      await updateIsSynced(userId);
    } catch (error) {
      console.error('Error importing events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('startDate', startDate);
  console.log('endDate', endDate);
  console.log('startTime', startTime);
  console.log('endTime', endTime);

  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex flex-col bg-white px-8 py-8 gap-2 rounded-bl-[20px] rounded-br-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
        
        <div className='month-header flex items-center gap-4'>
          <span className='text-green-800 font-nunito font-bold text-[32pt]'>Jan</span>
          <p className='text-green-800 font-nunito text-[32pt]'>2025</p>
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

        <CalendarEvents 
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

