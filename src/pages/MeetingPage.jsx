import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { handleAuth as googleHandleAuth, signOut } from '../services/googleAuth';
import { initializeGAPIClient } from '../services/googleCalender';
import { importEvents } from '../utils/importEvents';
import { calculateAvailability } from '../utils/availability';
import { fetchParticipants } from '../firebase.config';
import GroupAvailability from '../components/GroupAvailability';
import Legend from '../components/Legend';
import Calendar from '../components/Calendar';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, ThemeProvider, createTheme, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { addParticipantToGroup } from '../utils/addUserToGroup';
import { db } from '../firebase.config';
import { doc, getDoc } from 'firebase/firestore';

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

    // Get groupid from the URL
    const [groupId, setGroupId] = useState(null);
    const [eventTitle, setEvent] = useState('');
    const [StartDate, setStartDate] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [StartTime, setStartTime] = useState('');
    const [EndTime, setEndTime] = useState('');

    const { startDate, endDate, startTime, endTime, meetingId, event } = location.state || {
        startDate: StartDate,
        endDate:  EndDate,
        startTime: StartTime,
        endTime: EndTime,
        meetingId: groupId,
        event: eventTitle
    };

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [participants, setParticipants] = useState([]); // Dynamic participants

    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const groupId = pathParts[pathParts.length - 1];
        console.log('Group ID from URL:', groupId); // Debugging log
        setGroupId(groupId);

        // Get the meeting data from the Firestore database
        const getMeetingData = async () => {
            const docRef = doc(db, 'groups', groupId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists) {
                const data = docSnap.data();
                setEvent(data.title);
                setStartDate(formatDate(data.proposedDays[0].toDate()));
                setEndDate(formatDate(data.proposedDays[data.proposedDays.length - 1].toDate()));
                setStartTime(data.proposedStart);
                setEndTime(data.proposedEnd);
                console.log('Event title', data.title, 'Start Date', formatDate(data.proposedDays[0].toDate()), 'End Date',formatDate(data.proposedDays[data.proposedDays.length - 1].toDate()), 'Start Time', data.proposedStart, 'End Time', data.proposedEnd, 'created At', data.createdAt.toDate());
            } else {
                console.log('No such document!');
            }
        };

        getMeetingData();

        const initClient = async () => {
        try {
            await initializeGAPIClient();
            const storedAuth = localStorage.getItem('google-auth');
            const storedUserId = localStorage.getItem('user-id');
            if (storedAuth === 'true' && storedUserId) {
            setIsAuthenticated(true);
            setUserId(storedUserId);
            // add userid to the groupid
            addParticipantToGroup(groupId, storedUserId);
            console.log('Stored user ID:', storedUserId); // Debugging log
            }
        } catch (error) {
            console.error('Error initializing GAPI client:', error);
        }
        };

        gapi.load('client:auth2', initClient);
    }, []);

    // Push availability data to Firestore

    const handleGoogleAuth = async () => {
        try {
        const user = await googleHandleAuth(setIsAuthenticated);
        setUserId(user.uid);
        localStorage.setItem('user-id', user.uid);
        console.log('User ID set:', user.uid); // Debugging log
        } catch (error) {
        console.error('Error during authentication:', error);
        }
    };

    const handleSignOut = async () => {
        await signOut(setIsAuthenticated, setUserId);
    }

    useEffect(() => {
        const loadParticipants = async () => {
        try {
            const data = await fetchParticipants(meetingId, event); // Fetch data for the given meetingId and event
            setParticipants(data);
            console.log("Fetched participants:", data); // Debugging log
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
        };

        loadParticipants();
    }, [meetingId, event]);


    return (
        <div className="w-screen h-screen px-4 pb-4 bg-background relative">
            <div className="w-full h-full flex gap-4">
                <div className='w-full h-full flex flex-col gap-4'>
                <Calendar
                    isAuthenticated={isAuthenticated}
                    handleAuth={handleGoogleAuth}
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    userId={userId}
                />
                </div>
                <div className='w-[30%] h-full flex flex-col gap-4'>
                <Legend 
                    meetingID={meetingId}
                    eventName={event}
                    participants={participants}
                />
                <GroupAvailability
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
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