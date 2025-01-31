import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';

// Get start and dates
const today = new Date();
const nextWk = new Date(today);
nextWk.setDate(nextWk.getDate() + 7);

// get the start of the week
const day = today.getDay(); // 0 = Sunday, 1 = Monday, ...
const diff = (day === 0 ? -6 : 1) - day; 
today.setDate(today.getDate() + diff + 1);
nextWk.setDate(nextWk.getDate() + diff);

const todayDate = today.toISOString().split('T')[0];
const nextWkDate = nextWk.toISOString().split('T')[0];

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;