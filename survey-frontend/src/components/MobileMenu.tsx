import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = isAuthenticated ? [
    { text: 'Мои опросы', path: '/dashboard' },
    { text: 'Создать опрос', path: '/surveys/new' },
  ] : [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: 'background.paper',
          borderLeft: '2px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          Меню
        </Typography>
        
        {isAuthenticated && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Привет, {user?.name}
            </Typography>
            <List sx={{ mb: 3 }}>
              {menuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: isActiveLink(item.path) ? 'primary.main' : 'transparent',
                      color: isActiveLink(item.path) ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: isActiveLink(item.path) ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  color: 'text.primary',
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(79, 70, 229, 0.04)',
                }
              }}
            >
              Войти
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Зарегистрироваться
            </Button>
          </Box>
        ) : (
          <Button
            onClick={handleLogout}
            variant="outlined"
            fullWidth
            sx={{
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.primary'
              }
            }}
          >
            Выйти
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default MobileMenu;
