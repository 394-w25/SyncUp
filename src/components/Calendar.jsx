import React, { useState, useEffect } from 'react';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import CalendarEvents from './CalendarEvents';
import { importEvents } from '../utils/importEvents';

import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

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
  startMin,
  endMin,
  userId,
  activeWeekStart,
  activeWeekEnd,
  setActiveWeekStart,
  setActiveWeekEnd
}) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // for week toggler, store active week range
  const [weekStart, setWeekStart] = useState(() => {
    if (!startDate) return new Date();
    const [y, m, d] = startDate.split('-');
    return new Date(y, parseInt(m) - 1, d);
  });

  const [weekEnd, setWeekEnd] = useState(() => {
    if (!endDate) return new Date();
    const [y, m, d] = endDate.split('-');
    const endDateObj = new Date(y, parseInt(m) - 1, d);
    endDateObj.setHours(23, 59, 59);
    
    if (!startDate) return endDateObj;
    
    const startDateObj = new Date(startDate);
    if ((endDateObj - startDateObj) / (1000 * 60 * 60 * 24) <= 7) {
      return endDateObj;
    }
    
    const weekEnd = new Date(startDateObj);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59);
    return weekEnd;
  });

  const totalDays = Math.floor(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 *24));
  const showNavigation = totalDays > 7;

  const convertToISO = (date) => {
    return new Date(new Date(date).toISOString().replace(/T/, ' ').replace(/\..+/, ''));
  }

  const startDateISO = convertToISO(startDate);
  const endDateISO = convertToISO(endDate);

  // Convert to timestamps for comparison
  const showPrevious = weekStart.getTime() !== startDateISO.getTime();
  const showNext = weekEnd.getTime() !== endDateISO.getTime();

  // WEEK TOGGLER HANDLERS
  const handlePreviousWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);

    if (newStart < startDateISO) {
      setWeekStart(startDateISO);
      setActiveWeekStart(startDateISO);
      const newEnd = new Date(startDateISO);
      newEnd.setDate(newEnd.getDate() + 6);
      setWeekEnd(newEnd);
      setActiveWeekEnd(newEnd);
      return;
    }

    setWeekStart(newStart);
    setActiveWeekStart(newStart);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);
    setWeekEnd(newEnd);
    setActiveWeekEnd(newEnd);
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);

    if (newEnd > endDateISO) {
      setWeekStart(newStart);
      setActiveWeekStart(newStart);
      setWeekEnd(endDateISO);
      setActiveWeekEnd(endDateISO);
      return;
    }

    setWeekStart(newStart);
    setActiveWeekStart(newStart);
    setWeekEnd(newEnd);
    setActiveWeekEnd(newEnd);
  };

  if (!startDate || !endDate || startTime === undefined || endTime === undefined) {
    return null;
  }

  const handleImportEvents = async () => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error('User ID is null or undefined');
      }

      // console.log('Import dates: ', convertToISO(startDate), convertToISO(endDate));
      const events = await importEvents(
        userId, 
        convertToISO(startDate), 
        convertToISO(endDate)
      );
      setEvents(events);
    } catch (error) {
      console.error('Error importing events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex flex-col bg-white px-8 py-8 gap-2 rounded-bl-[20px] rounded-br-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
        
        <div className='month-header flex items-center gap-4'>
          <span className='text-green-800 font-nunito font-bold text-[32pt]'>{weekStart.toLocaleString('default', { month: 'long' })}</span>
          <p className='text-green-800 font-nunito text-[32pt]'>{weekStart.getFullYear()}</p>
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
        {/* WEEK-NAVIGATION BUTTONS */}
        {showNavigation && (
          <div className='flex justify-between gap-4'>
            <ThemeProvider theme={buttonTheme}>
              {showPrevious 
              ? (
                <Button 
                  variant='outlined' 
                  onClick={handlePreviousWeek}
                  startIcon={<ArrowBackIosNewRoundedIcon />}>
                    Previous Week
                </Button>
              )
              : (
                <Button 
                  variant='outlined' 
                  // onClick={handlePreviousWeek}
                  disabled
                  startIcon={<ArrowBackIosNewRoundedIcon />}>
                    Previous Week
                </Button>
              )
            }
              {showNext 
              ? (
                <Button 
                  variant='outlined' 
                  onClick={handleNextWeek}
                  endIcon={<ArrowForwardIosRoundedIcon />}>
                  Next Week
              </Button>
              )
              : (
                <Button 
                  variant='outlined' 
                  // onClick={handleNextWeek}
                  disabled
                  endIcon={<ArrowForwardIosRoundedIcon />}>
                  Next Week
              </Button>
              )}
            </ThemeProvider>
          </div>
        )}
        <CalendarEvents 
          startTime={startTime} 
          endTime={endTime} 
          startMin={startMin}
          endMin={endMin}
          startDate={weekStart} 
          endDate={weekEnd}
          events={events}
        />

      </div>
    </div>
  )
};

export default Calendar;

