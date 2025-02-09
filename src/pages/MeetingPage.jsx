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

import { fetchGroupData, fetchGroupAvailability, fetchUserDataInGroup } from '../utils/fetchGroupData';
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
    // Create date at midnight in local timezone
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return localDate.toISOString().split('T')[0];
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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {                
        const initializePage = async () => {
            setIsLoading(true);
            const pathParts = location.pathname.split('/');
            const groupId = pathParts[pathParts.length - 1];
            setGroupId(groupId);

            try {
                const docRef = doc(db, 'groups', groupId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists) {
                    const data = docSnap.data();

                    const formattedStart = formatDate(data.proposedDays[0].toDate());
                    const formattedEnd = formatDate(data.proposedDays[data.proposedDays.length - 1].toDate());
                    
                    setEvent(data.title);
                    setStartDate(formattedStart);
                    setEndDate(formattedEnd);
                    setStartTime(data.proposedStart);
                    setEndTime(data.proposedEnd);
                    // console.log('Event title', data.title, 'Start Date', formatDate(data.proposedDays[0].toDate()), 'End Date',formatDate(data.proposedDays[data.proposedDays.length - 1].toDate()), 'Start Time', data.proposedStart, 'End Time', data.proposedEnd, 'created At', data.createdAt.toDate());
                }
            } catch (error) {
                console.error('Error fetching meeting data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializePage();

        const initClient = async () => {
        try {
            await initializeGAPIClient();
            const storedAuth = localStorage.getItem('google-auth');
            const storedUserId = localStorage.getItem('user-id');
            if (storedAuth === 'true' && storedUserId) {
            setIsAuthenticated(true);
            setUserId(storedUserId);
            // console.log('Stored user ID:', storedUserId);
            // add userid to the groupid
            addParticipantToGroup(groupId, storedUserId);
            // console.log('Stored user ID:', storedUserId);
            }
        } catch (error) {
            console.error('Error initializing GAPI client:', error);
        }
        };

        gapi.load('client:auth2', initClient);
    }, []);

    // Fetches group data, group availability data, and participants data
    useEffect(() => {
        const getGroupData = async () => {
            const groupDataFromFetch = await fetchGroupData(groupId);
            const groupParticipantsData = await fetchUserDataInGroup(groupDataFromFetch.participants);
            const availabilityData = await fetchGroupAvailability(groupDataFromFetch, groupParticipantsData);
            
            setParticipantsData(groupParticipantsData);
            setGroupAvailabilityData(availabilityData);
            setGroupData(groupDataFromFetch);
        };
        getGroupData();
    }, [userId, meetingId, event]);

    // debugging
    // useEffect(() => {
    //     console.log('States updated:', {
    //         startDate,
    //         endDate,
    //         startTime,
    //         endTime
    //     });
    // }, [startDate, endDate, startTime, endTime]);

    // Push availability data to Firestore

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

    // console.log('set up startTime', startTime);
    // console.log('set up endTime', endTime);
    // console.log('set up groupData', groupData);
    // console.log('set up groupAvailabilityData', groupAvailabilityData);
    // console.log('set up participantsData', participantsData);
    // console.log('set up isAuthenticated', isAuthenticated);
    // console.log('set up userId', userId);
    // console.log('set up startDate', startDate);
    // console.log('set up endDate', endDate);
    // console.log('set up event', event);

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
                            userId={userId}
                        />
                    ) : (
                        <div className='w-full h-full flex justify-center items-center'>
                            <p className='text-2xl font-bold'>Loading...</p>
                        </div>
                    )
                }
                    
                </div>
                <div className='w-[30%] h-full flex flex-col gap-4'>
                    <Legend 
                        meetingID={meetingId}
                        eventName={event}
                        participantData={participantsData}
                    />
                    <GroupAvailability
                        groupData={groupData}
                        groupAvailabilityData={groupAvailabilityData}
                        startDate={startDate}
                        endDate={endDate}
                        startTime={startTime}
                        endTime={endTime}
                        />
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