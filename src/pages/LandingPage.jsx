import React, { useState } from "react";
import { Button, TextField, Card, CardContent, Typography, Grid, Container } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { createGroup } from '../utils/makeGroup';
import { Timestamp } from 'firebase/firestore';
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { Calendar } from "react-multi-date-picker";

const LandingPage = () => {
  const [meetingName, setMeetingName] = useState("");
  const [selectedDate, setSelectedDate] = useState([]);
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

    if (!meetingName || selectedDate.length === 0 || !selectedStartTime || !selectedEndTime) {
      alert("Please fill in all fields");
      return;
    }

    const proposedDays = selectedDate.map(date => 
      Timestamp.fromDate(date.toDate())
    );

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
    <Container maxWidth="sm" className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <Typography variant="h4" gutterBottom>
        Hi 👋 Let's set up your meeting
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
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                multiple={true}
                format="MM/DD/YYYY"
                style={{
                  width: '100%',
                  padding: '16.5px 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px'
                }}
                minDate={new Date()}
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
              <DatePicker
                disableDayPicker
                format="hh:mm A"
                plugins={[<TimePicker />]}
                value={selectedStartTime}
                onChange={setSelectedStartTime}
                style={{
                  width: '100%',
                  height: '56px',
                  padding: '16.5px 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px'
                }}
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
              <DatePicker
                disableDayPicker
                format="hh:mm A"
                plugins={[<TimePicker />]}
                value={selectedEndTime}
                onChange={setSelectedEndTime}
                style={{
                  width: '100%',
                  height: '56px',
                  padding: '16.5px 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px'
                }}
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
  );
};

export default LandingPage;