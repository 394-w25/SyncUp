import React, { useState } from "react";
import { Button, TextField, Card, CardContent, Typography, Grid, Container } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createGroup } from '../utils/makeGroup';
import { Timestamp } from 'firebase/firestore';

const LandingPage = () => {
  const [meetingName, setMeetingName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [groupLink, setGroupLink] = useState("");

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In clicked");
  };

  const handleStart = async () => {
    console.log("Meeting Name:", meetingName);
    console.log("Selected Date:", selectedDate);
    console.log("Selected Start Time:", selectedStartTime);
    console.log("Selected End Time:", selectedEndTime);

    if (!meetingName || !selectedDate || !selectedStartTime || !selectedEndTime) {
      alert("Please fill in all fields");
      return;
    }

    const proposedDays = [
      Timestamp.fromDate(new Date(selectedDate))
    ];

    const groupData = {
      title: meetingName,
      proposedDays: proposedDays,
      proposedStart: selectedStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedEnd: selectedEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const link = await createGroup(groupData);
      console.log('Group link:', link);
      setGroupLink(link);
      // You can redirect the user to the group link or show a success message
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm" className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
        <Typography variant="h4" gutterBottom>
          Hi 👋 Let’s set up your meeting
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{ mb: 4 }}
        >
          Sign in with Google
        </Button>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Name your meeting
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter meeting name"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  What days would you like to meet?
                </Typography>
                <DatePicker
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  What time would you like to start?
                </Typography>
                <TimePicker
                  value={selectedStartTime}
                  onChange={(newTime) => setSelectedStartTime(newTime)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  What time would you like to end?
                </Typography>
                <TimePicker
                  value={selectedEndTime}
                  onChange={(newTime) => setSelectedEndTime(newTime)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={handleStart}
          sx={{ mt: 4 }}
        >
          Start →
        </Button>

        {groupLink && (
          <Typography variant="body1" sx={{ mt: 4 }}>
            Group created! Here is your link: <a href={groupLink}>{groupLink}</a>
          </Typography>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default LandingPage;