import React, { useEffect, useState } from 'react';
import { handleAuth as googleHandleAuth, signOut } from '../services/googleAuth';
import GroupAvailability from '../components/GroupAvailability';
import Legend from '../components/Legend';
import Calendar from '../components/Calendar';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeProvider, createTheme, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { fetchGroupData, fetchGroupAvailability, fetchUserDataInGroup } from '../utils/fetchGroupData';

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
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
}

const MeetingPage = () => {
    const location = useLocation();
    const [groupId, setGroupId] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [groupAvailabilityData, setGroupAvailabilityData] = useState(null);
    const [participantsData, setParticipantsData] = useState({});
    const [eventTitle, setEvent] = useState('');
    const [StartDate, setStartDate] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [StartTime, setStartTime] = useState('');
    const [EndTime, setEndTime] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const groupId = pathParts[pathParts.length - 1];
        console.log('Group ID from URL:', groupId); // Debugging log
        setGroupId(groupId);
        
        const fetchData = async () => {
            const groupData = await fetchGroupData(groupId);
            setGroupData(groupData);

            // Get meeting data from the group data
            setEvent(groupData.title); // Set the event title
            setStartDate(formatDate(groupData.proposedDays[0].toDate())); // Set the start date
            setEndDate(formatDate(groupData.proposedDays[groupData.proposedDays.length - 1].toDate())); // Set the end date
            setStartTime(groupData.proposedStart); // Set the start time
            setEndTime(groupData.proposedEnd); // Set the end time


            if (groupData) {
                const availabilityData = await fetchGroupAvailability(groupData);
                setGroupAvailabilityData(availabilityData);

                const groupParticipantsData = await fetchUserDataInGroup(groupData.participants);
                setParticipantsData(groupParticipantsData);
            }
        };

        fetchData();

    }, []);

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
    };

    return (
        <div className="w-screen h-screen px-4 pb-4 bg-background relative">
            <div className="w-full h-full flex gap-4">
                <div className='w-full h-full flex flex-col gap-4'>
                <Calendar
                    isAuthenticated={isAuthenticated}
                    handleAuth={handleGoogleAuth}
                    startDate={StartDate}
                    endDate={EndDate}
                    startTime={StartTime}
                    endTime={EndTime}
                    userId={userId}
                />
                </div>
                <div className='w-[30%] h-full flex flex-col gap-4'>
                <Legend 
                    meetingID={groupId}
                    eventName={eventTitle}
                    participantData={participantsData}
                />
                <GroupAvailability
                    groupData={groupData}
                    groupAvailabilityData={groupAvailabilityData}
                    startDate={StartDate}
                    endDate={EndDate}
                    startTime={StartTime}
                    endTime={EndTime}
                    />
                </div>
                
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
    );
};

export default MeetingPage; 