import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Logo from '../components/Logo';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Logo in top left corner */}
      <div className="absolute top-5 left-10">
        <Logo />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="text-8xl font-bold text-green-800">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-1000">Oops! Page not found</h2>
        <p className="text-neutral-700 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Back to Home button */}
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: 'rgba(17, 107, 60, 1)',
            textTransform: 'none',
            fontFamily: 'Nunito',
            '&:hover': {
              backgroundColor: 'rgba(17, 107, 60, 0.9)',
            },
          }}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
