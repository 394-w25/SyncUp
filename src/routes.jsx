import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SetUp from './pages/SetUp';
import NotFound from './pages/NotFound';
import MeetingPage from './pages/MeetingPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/group/:id",
    element: <MeetingPage />,
  },
  {
    path: "/setup-meeting",
    element: <SetUp />, 
  },
  {
    path: "*",
    element: <NotFound />
  }
]);