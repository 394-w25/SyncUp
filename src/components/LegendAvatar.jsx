import { Avatar, AvatarGroup } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import Logo from "./Logo";

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  const nameParts = name.split(' ');
  
  if (nameParts.length >= 2) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${nameParts[0][0]}${nameParts[1][0]}`,
    };
  } else {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name[0]}`,
    };
  }
}

const LegendAvatar = ({ name, status }) => {
    return (
        <div className='flex gap-2 items-center'>
            <Avatar 
                {...stringAvatar(name)} 
                sx={{ width: 32, height: 32 }}/>
            <p className="truncate max-w-[150px]">{name}</p>
            {status 
                ? <CheckIcon sx={{color:'#116B3C'}} /> 
                : <ClearIcon sx={{color:'#B21B25'}} />} 
        </div>
    );
};

export default LegendAvatar;