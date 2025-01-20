import React from 'react';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const Logo = () => {
    return (
        <div className='flex items-center gap-4 text-green-800 text-[32pt]'>
            <EventAvailableIcon fontSize='text-[32pt]'/>
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