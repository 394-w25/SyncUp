import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';

// Get start and dates
const today = new Date();
const nextWk = new Date(today);
nextWk.setDate(today.getDate() + 7);
const todayDate = today.toISOString().split('T')[0];
const nextWkDate = nextWk.toISOString().split('T')[0];

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;