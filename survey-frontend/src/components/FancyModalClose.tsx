import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export interface FancyModalCloseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

const FancyModalClose: React.FC<FancyModalCloseProps> = ({
  open,
  onClose,
  title,
  message,
  buttonText = 'Закрыть'
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          animation: isClosing ? 'slideOut 0.3s ease-in-out' : 'slideIn 0.3s ease-out',
          overflow: 'hidden',
          '@keyframes slideIn': {
            '0%': {
              transform: 'translateY(-50px) scale(0.9)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0) scale(1)',
              opacity: 1,
            },
          },
          '@keyframes slideOut': {
            '0%': {
              transform: 'translateY(0) scale(1)',
              opacity: 1,
            },
            '100%': {
              transform: 'translateY(-50px) scale(0.9)',
              opacity: 0,
            },
          },
        },
      }}
      sx={{
        '& .MuiDialog-scrollPaper': {
          overflow: 'hidden',
        },
        '& .MuiDialog-paper': {
          overflow: 'hidden',
        },
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          animation: isClosing ? 'fadeOut 0.1s ease-in-out' : 'fadeIn 0.2s ease-out 0.1s both',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          '@keyframes fadeOut': {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              color: 'grey.700',
              transform: 'rotate(90deg)',
              backgroundColor: 'grey.100',
            },
            animation: isClosing ? 'spinOut 0.3s ease-in-out' : 'spinIn 0.3s ease-out 0.2s both',
            '@keyframes spinIn': {
              '0%': { transform: 'rotate(0deg) scale(0.8)', opacity: 0 },
              '100%': { transform: 'rotate(0deg) scale(1)', opacity: 1 },
            },
            '@keyframes spinOut': {
              '0%': { transform: 'rotate(0deg) scale(1)', opacity: 1 },
              '100%': { transform: 'rotate(90deg) scale(0.8)', opacity: 0 },
            },
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M18 6L6 18M6 6l12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        sx={{
          animation: isClosing ? 'slideUp 0.3s ease-in-out' : 'slideDown 0.3s ease-out 0.15s both',
          '@keyframes slideDown': {
            '0%': { 
              transform: 'translateY(-20px)', 
              opacity: 0 
            },
            '100%': { 
              transform: 'translateY(0)', 
              opacity: 1 
            },
          },
          '@keyframes slideUp': {
            '0%': { 
              transform: 'translateY(0)', 
              opacity: 1 
            },
            '100%': { 
              transform: 'translateY(-20px)', 
              opacity: 0 
            },
          },
        }}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          px: 3, 
          pb: 3,
          animation: isClosing ? 'buttonSlideUp 0.3s ease-in-out' : 'buttonSlideDown 0.3s ease-out 0.2s both',
          '@keyframes buttonSlideDown': {
            '0%': { 
              transform: 'translateY(20px)', 
              opacity: 0 
            },
            '100%': { 
              transform: 'translateY(0)', 
              opacity: 1 
            },
          },
          '@keyframes buttonSlideUp': {
            '0%': { 
              transform: 'translateY(0)', 
              opacity: 1 
            },
            '100%': { 
              transform: 'translateY(20px)', 
              opacity: 0 
            },
          },
        }}
      >
        <Button 
          onClick={handleClose}
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { 
              bgcolor: 'primary.dark',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.2s ease-in-out',
            minWidth: '100px',
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FancyModalClose;
