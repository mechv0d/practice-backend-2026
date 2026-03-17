import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import CreateIcon from '@mui/icons-material/Create';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
    const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    onClose();
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = isAuthenticated ? [
    { text: 'Мои опросы', path: '/dashboard' },
    { text: 'Создать опрос', path: '/surveys/new' },
  ] : [];

  return (
    <>
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
            <Box sx={{ display: 'flex', alignItems: 'start', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Typography variant="body2" color="text.primary">
                С подключением,<br /> {user?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user?.role === 'author' ? (
                  <CreateIcon sx={{ color: '#4f46e5', fontSize: 18, marginBottom: '4px' }} />
                ) : (
                  <AssignmentIcon sx={{ color: '#16a34a', fontSize: 18, marginBottom: '2px' }} />
                )}
              <Typography sx={{ color: user?.role === 'author' ? '#4f46e5' : '#16a34a' }}>
                {user?.role === 'author' ? 'Автор' : 'Респондент'}
              </Typography></Box>
            </Box>
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

    <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
      <DialogTitle>Подтверждение выхода</DialogTitle>
      <DialogContent>
        <Typography>Вы уверены, что хотите выйти из аккаунта?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelLogout} variant="outlined">
          Отмена
        </Button>
        <Button onClick={confirmLogout} variant="contained" color="primary">
          Выйти
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default MobileMenu;
