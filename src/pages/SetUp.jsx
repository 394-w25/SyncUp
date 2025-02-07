import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, ThemeProvider, createTheme, TextField, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import GoogleIcon from '@mui/icons-material/Google';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded';

import { Calendar } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import moment from 'moment';
import { Timestamp } from 'firebase/firestore';
import { createGroup } from '../utils/makeGroup';
import { handleAuth } from '../services/googleAuth'


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

const customTheme = (outerTheme) =>
  createTheme({
    palette: {
      mode: outerTheme.palette.mode,
    },
    typography: {
        fontFamily: 'Nunito',
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '--TextField-brandBorderColor': '#1DB566',
            '--TextField-brandBorderHoverColor': '#179051',
            '--TextField-brandBorderFocusedColor': '#1DB566',
            '& label.Mui-focused': {
              color: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            '&::before': {
              borderBottom: '2px solid var(--TextField-brandBorderColor)',
            },
            '&:hover:not(.Mui-disabled, .Mui-error):before': {
              borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
            },
            '&.Mui-focused:after': {
              borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiTimeClock: {
        styleOverrides: {
          root: {
            backgroundColor: "white",
            "& .css-umzx0k-MuiClock-pin": {
                backgroundColor: "green",
            },
            "& .css-1tci2yf-MuiButtonBase-root-MuiIconButton-root-MuiClock-amButton": {
                backgroundColor: "green",
            },
            "& .css-1dq2mpt-MuiButtonBase-root-MuiIconButton-root-MuiClock-pmButton": {
                backgroundColor: "green",
            },
            "& .css-pncb2q-MuiClockPointer-root": {
                backgroundColor: "green",
            },
            "& .css-1h2qg9i-MuiClockPointer-root": {
                backgroundColor: "green",
            },
            ".css-f53ilk-MuiClockPointer-thumb": {
                border: "16px solid green",
            },
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            color: "green",
          },
        },
      },
    },
  });

const SetUp = () => {
    const [meetingName, setMeetingName] = useState("");
    const [selectedDate, setSelectedDate] = useState([]);
    const [userName, setUserName] = useState("");
    const [selectedStartTime, setSelectedStartTime] = useState(moment().set({ hour: 9, minute: 0 }).toDate());
    const [selectedEndTime, setSelectedEndTime] = useState(moment().set({ hour: 18, minute: 0 }).toDate());
    const [timeError, setTimeError] = useState('');
    const [groupLink, setGroupLink] = useState("");
    const outerTheme = useTheme();
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    // const handleGoogleSignIn = async () => {
    //     try {
    //         const user = await signInWithGoogle();
    //         localStorage.setItem('google-auth', 'true');
    //         localStorage.setItem('user-id', user.uid); // Add this line
    //         return user;
    //       } catch (error) {
    //         console.error('Error during authentication:', error);
    //         throw error;
    //       }
    // };

    const handleGoogleAuth = async () => {
        try {
        const user = await handleAuth(setIsAuthenticated);
        setUserId(user.uid);
        setUserName(user.displayName);
        localStorage.setItem('user-id', user.uid);
        console.log('User ID set:', user.uid); // Debugging log
        } catch (error) {
        console.error('Error during authentication:', error);
        }
    };


    const validateTimeRange = (start, end) => {
        if (!start || !end) return false;
        const startMoment = moment(start);
        const endMoment = moment(end);
        return endMoment.isAfter(startMoment);
    };

    const handleTimeChange = (newTime, isStart) => {
        if (isStart) {
            setSelectedStartTime(newTime);
            if (selectedEndTime && !validateTimeRange(newTime, selectedEndTime)) {
                setTimeError('End time must be after start time');
            } else {
                setTimeError('');
            }
        } else {
            setSelectedEndTime(newTime);
            if (selectedStartTime && !validateTimeRange(selectedStartTime, newTime)) {
                setTimeError('End time must be after start time');
            } else {
                setTimeError('');
            }
        }
    };

    const handleStart = async () => {
        if (!meetingName || selectedDate.length === 0 || !selectedStartTime || !selectedEndTime) {
            alert("Please fill in all fields");
            return;
        }

        const proposedDays = selectedDate.map(date => 
            Timestamp.fromDate(date.toDate())
        );

        const startHour = moment(selectedStartTime).hour() + moment(selectedStartTime).minutes() / 60;
        const endHour = moment(selectedEndTime).hour() + moment(selectedEndTime).minutes() / 60;

        const groupData = {
            title: meetingName,
            proposedDays: proposedDays,
            proposedStart: startHour,
            proposedEnd: endHour,
            creator: userId,
            participants: []
        };

        try {
            const result = await createGroup(groupData);
            setGroupLink(result.link);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(groupLink);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-background">
            <div className="w-full max-w-6xl">
                <h1 className="text-5xl font-bold mb-16 text-center">Hi 👋 Let's set up your meeting</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="flex flex-col gap-9">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                
                            <ThemeProvider theme={buttonTheme}>
                                {!userName ? (
                                    <>
                                        <h3 className="text-xl font-semibold">First,</h3>
                                        <Button 
                                            variant='outlined' 
                                            color='secondary'
                                            onClick={handleGoogleAuth}
                                            style={{textTransform: 'none', fontSize: '16px'}}
                                            startIcon={<GoogleIcon />}>
                                            Sign in with Google
                                        </Button>
                                    </>
                                ) : (
                                    <h3 className="text-xl font-semibold">Welcome, {userName}</h3>
                                )}
                            </ThemeProvider>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-xl font-semibold mb-8 text-center">What days might work for you?</h3>
                            <div className="flex justify-center py-8">
                                <Calendar 
                                    multiple
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    sort 
                                    minDate={new Date()}
                                    plugins={[<DatePanel />]}
                                    weekDays={["S", "M", "T", "W", "T", "F", "S"]}
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-lg shadow-md p-8 pb-12 pt-8">
                            <ThemeProvider theme={customTheme(outerTheme)}>
                                <TextField
                                    required
                                    label="Name your meeting"
                                    variant="standard"
                                    fullWidth
                                    value={meetingName}
                                    onChange={(e) => setMeetingName(e.target.value)}
                                />
                            </ThemeProvider>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8 pb-12 pt-8">
                            <h3 className="text-xl font-semibold mb-6 text-center">What times might work for you?</h3>
                            <div className="flex flex-col sm:flex-row justify-center items-end gap-8 text-lg">
                                <ThemeProvider theme={customTheme(outerTheme)}>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <TimePicker 
                                            label="Start Time" 
                                            views={['hours', 'minutes']} 
                                            format="hh:mm A" 
                                            value={moment(selectedStartTime)}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                            }}
                                            closeOnSelect={false}
                                            minutesStep={30}
                                            onChange={(newValue) => handleTimeChange(newValue, true)}
                                            error={!!timeError}
                                            slotProps={{ 
                                                textField: { 
                                                    variant: "standard",
                                                    sx: { width: '150px' }
                                                },
                                            }}
                                        />
                                        <div className="text-green-800 font-semibold">to</div>
                                        <TimePicker 
                                            label="End Time" 
                                            views={['hours', 'minutes']} 
                                            format="hh:mm A" 
                                            value={moment(selectedEndTime)}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                            }}
                                            closeOnSelect={false}
                                            minutesStep={30}
                                            onChange={(newValue) => handleTimeChange(newValue, false)}
                                            error={!!timeError}
                                            slotProps={{ 
                                                textField: { 
                                                    variant: "standard",
                                                    sx: { width: '150px' }
                                                } 
                                            }}
                                        />
                                    </LocalizationProvider>
                                </ThemeProvider>
                            </div>
                            {timeError && (
                                <p className="text-red-500 text-sm mt-2 text-center">{timeError}</p>
                            )}
                        </div>

                        <div className="flex flex-col bg-white rounded-lg shadow-md p-8 pb-12 pt-8 items-center">
                            <h3 className="text-xl font-semibold mb-6 w-full ">Share the link with your team:</h3>
                            {!groupLink && (<ThemeProvider theme={buttonTheme}>
                                <Button 
                                variant='outlined' 
                                color='secondary'
                                onClick={handleStart}
                                style={{textTransform: 'none'}}
                                endIcon={<AddLinkRoundedIcon />}
                                >
                                    Get your group link
                                </Button>
                            </ThemeProvider>
                            )}

                            {groupLink && (
                            <div className="p-4 rounded-lg flex items-center justify-between">
                                <span className="break-all mr-2 font-nunito">
                                    {groupLink}
                                </span>
                                <ThemeProvider theme={buttonTheme}>
                                    <IconButton 
                                        onClick={handleCopyLink}
                                        color="primary"
                                        size="small"
                                        title="Copy to clipboard"
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </ThemeProvider>
                                {showCopySuccess && (
                                    <DoneIcon className="text-green-600 text-sm font-nunito" />
                                )}
                            </div>
                            )}
                        </div>

                        {groupLink && (
                            <div className="rounded-lg flex items-center justify-between">
                                <ThemeProvider theme={buttonTheme}>
                                    <Button 
                                        variant='contained' 
                                        color='primary'
                                        onClick={() => {
                                            const startHour = moment(selectedStartTime).hour();
                                            const endHour = moment(selectedEndTime).hour();
                                            const firstDate = moment(selectedDate[0].toDate()).format('YYYY-MM-DD');
                                            const lastDate = moment(selectedDate[selectedDate.length - 1].toDate()).format('YYYY-MM-DD');
                                            
                                            navigate(`/group/${groupLink.split('/').pop()}`, {
                                                state: {
                                                    startDate: firstDate,
                                                    endDate: lastDate,
                                                    startTime: startHour,
                                                    endTime: endHour,
                                                    meetingId: groupLink.split('/').pop(),
                                                    event: meetingName
                                                }
                                            });
                                        }}
                                        style={{textTransform: 'none', fontSize: '16px'}}
                                        fullWidth
                                        endIcon={<ArrowForwardIcon />}
                                    >
                                        Start Scheduling
                                    </Button>
                                </ThemeProvider>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SetUp;