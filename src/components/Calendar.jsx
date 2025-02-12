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
  userId,
  meetingID
}) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [isCopied, setIsCopied] = useState(false);

  // const handleCopyLink = () => {
  //     const meetingLink = `syncup-5bc71.web.app/group/${meetingID}`; 
  //     // TODO: fix meetingLink 
  //     navigator.clipboard.writeText(meetingLink);
  //     setIsCopied(true);

  //     setTimeout(() => {
  //         setIsCopied(false);
  //     }, 2000);
  // }

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

    if (newStart < weekStart) {
      setWeekStart(startDateISO);
      const newEnd = new Date(startDateISO);
      newEnd.setDate(newEnd.getDate() + 6);
      setWeekEnd(newEnd);
      return;
    }
    setWeekStart(newStart);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);
    setWeekEnd(newEnd);
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);

    if (newEnd > weekEnd) {
      setWeekStart(newStart);
      setWeekEnd(endDateISO);
      return;
    }
    setWeekStart(newStart);
    setWeekEnd(newEnd);
  };

  useEffect(() => {
    handleImportEvents();
  }, []);

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
    <div className="w-full h-full flex flex-col bg-white px-8 pt-12 pb-4 gap-2 rounded-[20px] lg:rounded-b-[20px] lg:rounded-t-none shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
      
      <div className='month-header flex items-center gap-2 sm:gap-4 mb-4'>
        <span className='text-green-800 font-nunito font-bold text-2xl sm:text-[32pt]'>{weekStart.toLocaleString('default', { month: 'long' })}</span>
        <p className='text-green-800 font-nunito text-2xl sm:text-[32pt]'>{weekStart.getFullYear()}</p>
      </div>

      <div className='row-button flex flex-col sm:flex-row justify-between gap-4 sm:gap-0'>
        <div className="w-full sm:w-auto">
          {!isAuthenticated ? (
            <ThemeProvider theme={buttonTheme}>
              <Button 
                fullWidth
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
                fullWidth
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
        </div>

        <div className='flex flex-wrap gap-4 sm:gap-8 justify-center sm:justify-end'>
          <div className='flex gap-2 items-center'>
            <CustomShape fillColor="#E8E8E8" outsideColor="#333333"/>
            <p className="text-sm sm:text-base">Your events</p>
          </div>
          <div className='flex gap-2 items-center'>
            <CustomShape fillColor="#B1CCFA" outsideColor="#083684"/>
            <p className="text-sm sm:text-base">Your availability</p>
          </div>
        </div>
      </div>

      {showNavigation && (
        <div className='flex justify-between gap-2 sm:gap-4 mt-2'>
          <ThemeProvider theme={buttonTheme}>
            {showPrevious ? (
              <Button 
                variant='outlined' 
                onClick={handlePreviousWeek}
                startIcon={<ArrowBackIosNewRoundedIcon />}
                className="text-xs sm:text-base">
                <span className="hidden sm:inline">Previous Week</span>
                <span className="sm:hidden">Prev</span>
              </Button>
            ) : (
              <Button 
                variant='outlined' 
                disabled
                startIcon={<ArrowBackIosNewRoundedIcon />}
                className="text-xs sm:text-base">
                <span className="hidden sm:inline">Previous Week</span>
                <span className="sm:hidden">Prev</span>
              </Button>
            )}
            {showNext ? (
              <Button 
                variant='outlined' 
                onClick={handleNextWeek}
                endIcon={<ArrowForwardIosRoundedIcon />}
                className="text-xs sm:text-base">
                <span className="hidden sm:inline">Next Week</span>
                <span className="sm:hidden">Next</span>
              </Button>
            ) : (
              <Button 
                variant='outlined' 
                disabled
                endIcon={<ArrowForwardIosRoundedIcon />}
                className="text-xs sm:text-base">
                <span className="hidden sm:inline">Next Week</span>
                <span className="sm:hidden">Next</span>
              </Button>
            )}
          </ThemeProvider>
        </div>
      )}
      <CalendarEvents 
        startTime={startTime} 
        endTime={endTime} 
        startDate={weekStart} 
        endDate={weekEnd}
        events={events}
      />

    </div>
  )
};

export default Calendar;

