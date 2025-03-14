import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { IconButton } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const appTheme = createTheme({
  palette: {
    primary: {
      main: "rgba(17, 107, 60, 1)",
    },
    secondary: {
      main: "rgba(126, 19, 26, 1)",
    },
    error: {
      main: "rgba(222, 34, 47, 1)",
    },
    background: {
      paper: "rgba(255, 255, 255, 1)",
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.6)",
      disabled: "rgba(0, 0, 0, 0.38)",
    },
  },
  typography: {
    fontFamily: "Nunito",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.body1,
        }),
        head: ({ theme }) => ({
          ...theme.typography.body2,
        }),
        body: ({ theme }) => ({
          ...theme.typography.body1,
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }) => ({
          ...theme.typography.body1,
        }),
        secondary: ({ theme }) => ({
          ...theme.typography.body2,
        }),
      },
    },
  },
});


const LandingPage = () => {
//   const theme = useTheme();
  const navigate = useNavigate();

  return (
    <MuiThemeProvider theme={appTheme}>
        <CssBaseline />
        <div className="absolute top-4 md:top-5 left-4 md:left-10">
            <Logo />
        </div>
        <div className="landing-cta flex bg-background flex-col items-center justify-center min-h-screen px-4 md:px-8">
            <div className="max-w-4xl w-full flex flex-wrap justify-center items-center mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl text-center md:text-left font-bold text-neutral-1000">
                    Hi 👋 Let's set up your <span className="text-green-800">meeting</span>!
                </h1>
                {/* <h1 className="text-3xl md:text-4xl lg:text-5xl ml-3 font-bold text-green-800">
                    meeting
                </h1>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-1000">
                    !
                </h1> */}
            </div>
            <div className="landing-button-container border-2 border-green-800 rounded-full p-2 hover:scale-105 transition-transform">
                <IconButton aria-label="Get Started arrow" color="primary" size="large"
                    onClick={() => {
                        navigate("/setup-meeting");
                    }}>
                    <ArrowForwardIcon />
                </IconButton>
            </div>
        </div>
    </MuiThemeProvider>
  );
};

export default LandingPage;