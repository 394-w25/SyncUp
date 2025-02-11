import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { handleAuth as googleHandleAuth, signOut } from '../services/googleAuth';
import { initializeGAPIClient } from '../services/googleCalender';
import GroupAvailability from '../components/GroupAvailability';
import Legend from '../components/Legend';
import Calendar from '../components/Calendar';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeProvider, createTheme, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';

import { fetchGroupData, fetchGroupAvailability, fetchUserDataInGroup } from '../utils/fetchGroupData';
import { addParticipantToGroup } from '../utils/addUserToGroup';

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

function formatDate(input) {
    const date = new Date(input);
    // Create date at midnight in local timezone
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return localDate.toISOString().split('T')[0];
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

const MeetingPage = () => {
    const location = useLocation();

    // Get groupId from the URL
    const [groupId, setGroupId] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [groupAvailabilityData, setGroupAvailabilityData] = useState({});
    const [participantsData, setParticipantsData] = useState({});

    const [eventTitle, setEvent] = useState('');
    const [StartDate, setStartDate] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [StartTime, setStartTime] = useState('');
    const [EndTime, setEndTime] = useState('');
    const [StartMin, setStartMin] = useState('');
    const [EndMin, setEndMin] = useState('');

    const { startDate, endDate, startTime, endTime, startMin, endMin, meetingId, event } = location.state || {
        startDate: StartDate,
        endDate:  EndDate,
        startTime: StartTime,
        endTime: EndTime,
        startMin: StartMin,
        endMin: EndMin,
        meetingId: groupId,
        event: eventTitle
    };

    const [activeWeekStart, setActiveWeekStart] = useState(() => parseLocalDate(startDate));
    const [activeWeekEnd, setActiveWeekEnd] = useState(() => parseLocalDate(endDate));

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    // Fetches group data, group availability data, and participants data
    useEffect(() => {   
        const initClient = async () => {
            await initializeGAPIClient();
            const storedAuth = localStorage.getItem('google-auth');
            const storedUserId = localStorage.getItem('user-id');
            if (storedAuth === 'true' && storedUserId) {
                setIsAuthenticated(true);
                setUserId(storedUserId);
                addParticipantToGroup(groupId, storedUserId);
                // console.log('Stored user ID:', storedUserId);
            }
        };
        gapi.load('client:auth2', initClient);

        const getGroupData = async () => {
            const groupIdFromPath = location.pathname.split('/').pop();
            const groupDataFromFetch = await fetchGroupData(groupIdFromPath);
            const groupParticipantsData = await fetchUserDataInGroup(groupDataFromFetch.participants);
            const availabilityData = await fetchGroupAvailability(groupDataFromFetch, groupParticipantsData);
            
            // console.log('groupIdFromPath', groupIdFromPath);
            console.log('groupDataFromFetch', groupDataFromFetch);
            // console.log('groupParticipantsData', groupParticipantsData);
            // console.log('availabilityData', availabilityData);
            
            setParticipantsData(groupParticipantsData);
            setGroupAvailabilityData(availabilityData);
            setGroupData(groupDataFromFetch);
            setGroupId(groupIdFromPath);
            
            // junk code but its necessary
            setEvent(groupDataFromFetch.title);
            setStartDate(formatDate(groupDataFromFetch.proposedDays[0].toDate()));
            setEndDate(formatDate(new Date(groupDataFromFetch.proposedDays[0].toDate().getDate() + 6)));
            setStartTime(groupDataFromFetch.proposedStart);
            setEndTime(groupDataFromFetch.proposedEnd);
        };
             
        getGroupData();

    }, [userId, meetingId]);

    const handleGoogleAuth = async () => {
        try {
            const user = await googleHandleAuth(setIsAuthenticated);
            setUserId(user.uid);
            localStorage.setItem('user-id', user.uid);
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    };

    const handleSignOut = async () => {
        await signOut(setIsAuthenticated, setUserId);
    }

    return (
        <div className="w-screen h-screen px-4 pb-4 bg-background relative">
            <div className="w-full h-full flex gap-4">
                <div className='w-full h-full flex flex-col gap-4'>
                    {startDate && endDate && startTime && endTime ? (
                        <Calendar
                            isAuthenticated={isAuthenticated}
                            handleAuth={handleGoogleAuth}
                            startDate={startDate}
                            endDate={endDate}
                            startTime={startTime}
                            endTime={endTime}
                            startMin={startMin}
                            endMin={endMin}
                            userId={userId}
                            setActiveWeekStart={setActiveWeekStart}
                            setActiveWeekEnd={setActiveWeekEnd}
                            meetingID={meetingId}
                        />
                    ) : (
                        <div className='w-full h-full flex justify-center items-center'>
                            <p className='text-2xl font-bold'>Loading...</p>
                        </div>
                    )}                    
                </div>
                <div className='w-[30%] h-full flex flex-col gap-4'>
                    <Legend 
                        meetingID={meetingId}
                        eventName={event}
                        participantData={participantsData}
                    />
                    {groupData ? (
                        <GroupAvailability
                            groupData={groupData}
                            groupAvailabilityData={groupAvailabilityData}
                            activeWeekStart={activeWeekStart}
                            activeWeekEnd={activeWeekEnd}
                        />
                    ) : (
                        <div className='w-full h-full flex justify-center items-center'>
                            <p className='text-2xl font-bold'>Loading...</p>
                        </div>
                    )}
                </div>

                {/* Sign out button in bottom left corner */}
                {isAuthenticated && (
                    <div className="absolute bottom-4 right-4">
                    <ThemeProvider theme={buttonTheme}>
                        <IconButton
                            onClick={handleSignOut}
                            color="secondary"
                            size="small"
                            title="Sign Out"
                        >
                            <LogoutIcon />
                        </IconButton>
                    </ThemeProvider>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingPage; 