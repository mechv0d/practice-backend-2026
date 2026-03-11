import React from 'react';
import { useThemeContext } from '../context/ThemeContext';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <IconButton
      onClick={toggleTheme}
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        // backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
        color: isDarkMode ? '#818cf8' : '#4f46e5',
        // border: `2px solid ${isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`,
        transition: 'all 0.3s ease',
        transform: 'scale(1.2)',
        '&:hover': {
          backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.2)',
          transform: 'scale(0.95)',
        },
        '&:active': {
          transform: 'scale(0.5)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDarkMode ? (
          // Moon icon for dark mode
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="currentColor"
            />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </Box>
    </IconButton>
  );
};

export default ThemeToggle;
