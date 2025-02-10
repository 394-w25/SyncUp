import Logo from "./Logo";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { useState } from 'react';

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

    // const handleCopyLink = () => {
    //     const meetingLink = `syncup-5bc71.web.app/group/${meetingID}`; 
    //     // TODO: fix meetingLink 
    //     navigator.clipboard.writeText(meetingLink);
    //     setIsCopied(true);

    //     setTimeout(() => {
    //         setIsCopied(false);
    //     }, 2000);
    // }

    const [isCopied, setIsCopied] = useState(false);
    return (
        <div className="w-full h-[25%]">
            <div className="w-full h-full py-8 px-8 bg-white rounded-bl-[20px] rounded-br-[20px] shadow-[0px_7px_15.699999809265137px_0px_rgba(17,107,60,0.06)]">
                <div className='flex gap-8 justify-between'>
                    <div className="flex flex-col gap-2">
                        <Logo size={"32pt"}/>
                        <span>Meeting ID: {meetingID}</span>
                        <span>Event: {eventName}</span>
                        {/* {isCopied ? (
                            <ThemeProvider theme={buttonTheme}>
                                <Button 
                                    variant='outlined' 
                                    color='primary' 
                                    style={{textTransform: 'none'}}
                                    endIcon={<TaskAltRoundedIcon />}
                                    disabled={true}
                                >
                                    Copied to clipboard
                                </Button>
                            </ThemeProvider>
                        ) : (
                            <ThemeProvider theme={buttonTheme}>
                                <Button 
                                    variant='outlined' 
                            color='primary'
                            style={{textTransform: 'none'}}
                            onClick={handleCopyLink}
                            endIcon={<ContentCopyIcon />}>
                                Copy Share Link
                            </Button>
                        </ThemeProvider>
                        )} */}
                    </div>
                    <div className="flex flex-col gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        <div className="flex gap-2 items-center">
                            <p className="truncate max-w-[150px]">Participants:</p>
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
};

export default Legend;