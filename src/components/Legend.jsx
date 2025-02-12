import Logo from "./Logo";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { useState } from 'react';
import { IconButton } from '@mui/material';

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

const Legend = ({meetingID, eventName, participantData}) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopyLink = () => {
        const meetingLink = `syncup-5bc71.web.app/group/${meetingID}`; 
        navigator.clipboard.writeText(meetingLink);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    return (
        <div className="w-full">
            <div className="w-full bg-white rounded-b-[20px] py-4 px-8 lg:p-8 shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
                <div className='flex gap-8'>
                    <div className="flex flex-col gap-2">
                        <div className='hidden md:block'>
                            <Logo size={"32pt"}/>
                        </div>
                        <div className='block md:hidden'>
                            <Logo size={"24pt"}/>
                        </div>
                        {/* Meeting ID for larger screens */}
                        <span className="hidden md:block">Meeting ID: {meetingID}</span>
                        {/* Meeting name with copy icon for smaller screens */}
                        <div className="flex items-center gap-2 md:hidden">
                            <span className="font-medium">Meeting: {eventName}</span>
                            <ThemeProvider theme={buttonTheme}>
                                <IconButton 
                                    onClick={handleCopyLink}
                                    size="small"
                                    color="primary"
                                >
                                    {isCopied ? <TaskAltRoundedIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                </IconButton>

                            </ThemeProvider>
                            
                        </div>
                        {/* Event name for larger screens */}
                        <span className="hidden md:block">Event: {eventName}</span>
                        {/* Copy button for larger screens */}
                        <div className="hidden md:block">
                            <ThemeProvider theme={buttonTheme}>
                                <Button 
                                    variant='outlined' 
                                    color='primary'
                                    style={{textTransform: 'none'}}
                                    onClick={handleCopyLink}
                                    endIcon={isCopied ? <TaskAltRoundedIcon /> : <ContentCopyIcon />}
                                >
                                    {isCopied ? 'Copied to clipboard' : 'Copy Share Link'}
                                </Button>
                            </ThemeProvider>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        <div className="flex gap-2 items-center">
                            <p className="truncate font-bold max-w-[150px]">Participants:</p>
                        </div>
                        {Object.values(participantData).map((data, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <p className="truncate max-w-[150px]">{data.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Legend;