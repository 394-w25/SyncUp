import React from 'react';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const Logo = ({ color = 'text-green-800', size = '32pt' }) => {
    return (
        <div className={`flex items-center gap-4 select-none ${color}`} style={{ fontSize: size }}>
            <EventAvailableIcon sx={{ fontSize: 'inherit' }}/>
            <div className='block'>
                <span className='font-bold'>
                    Sync
                </span>
                <span className='font-regular'>
                    Up!
                </span>
            </div>
        </div>
    )
}

export default Logo;