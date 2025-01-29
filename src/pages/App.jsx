import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SetUp from './SetUp';
import MeetingPage from './MeetingPage';
import LandingPage from './LandingPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SetUp />} />
      <Route path="/group/:id" element={<MeetingPage />} />
    </Routes>
  );
};

export default App;