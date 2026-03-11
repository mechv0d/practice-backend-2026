import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Link
              to="/"
              style={{ textDecoration: 'none' }}
              onMouseEnter={(e) => {
                const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                const textBox = e.currentTarget.querySelector('.logo-text') as HTMLElement;
                if (img) img.style.transform = 'scale(1.1)';
                if (textBox) textBox.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                const textBox = e.currentTarget.querySelector('.logo-text') as HTMLElement;
                if (img) img.style.transform = 'scale(1)';
                if (textBox) textBox.style.transform = 'translateX(0px)';
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, '&:hover': { color: 'primary.main' } }}>
                <img 
                  src="/logo512.png" 
                  alt="UmFragger" 
                  style={{ 
                    width: 32, 
                    height: 32,
                    borderRadius: '8px',
                    transition: 'transform 0.2s ease-in-out'
                  }} 
                />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0,
                  transition: 'transform 0.2s ease-in-out',
                  className: 'logo-text'
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#0D144A',
                      transition: 'color 0.2s ease-in-out',
                      '&:hover': { color: '#067BFE' }
                    }}
                  >
                    Um
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#067BFE',
                      transition: 'color 0.2s ease-in-out',
                      '&:hover': { color: '#067BFE' }
                    }}
                  >
                    Fragger
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <Box sx={{ ml: 3, display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button
                  component={Link}
                  to="/dashboard"
                  color={isActiveLink('/dashboard') ? 'primary' : 'inherit'}
                  sx={{
                    borderBottom: 2,
                    borderColor: isActiveLink('/dashboard') ? 'primary.main' : 'transparent',
                    borderRadius: '16px 16px 0 0',
                    px: 1,
                    minHeight: 64,
                    color: isActiveLink('/dashboard') ? 'text.primary' : 'text.secondary',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'primary.light',
                      color: 'text.primary',
                      bgcolor: 'transparent',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Мои опросы
                </Button>
                <Button
                  component={Link}
                  to="/surveys/new"
                  color={isActiveLink('/surveys/new') ? 'primary' : 'inherit'}
                  sx={{
                    borderBottom: 2,
                    borderColor: isActiveLink('/surveys/new') ? 'primary.main' : 'transparent',
                    borderRadius: '16px 16px 0 0',
                    px: 1,
                    minHeight: 64,
                    color: isActiveLink('/surveys/new') ? 'text.primary' : 'text.secondary',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'primary.light',

                      color: 'text.primary',
                      bgcolor: 'transparent',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Создать опрос
                </Button>
              </Box>
            )}

            {/* Desktop Actions */}
            <Box sx={{ ml: 'auto', display: { xs: 'none', sm: 'flex' }, gap: 2, alignItems: 'center' }}>
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Привет, {user?.name}
                  </Typography>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'action.focus'
                      }
                    }}
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{ 
                      color: 'text.secondary', 
                      borderColor: 'divider',
                      minHeight: 36,
                      px: 3,
                      py: .8,
                      boxSizing: 'border-box',
                      '&:hover': { 
                        color: 'text.primary',
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(79, 70, 229, 0.04)'
                      } 
                    }}
                  >
                    Войти
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      bgcolor: 'primary.main',
                      minHeight: 36,
                      px: 3,
                      py: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Зарегистрироваться
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile Actions */}
            <Box sx={{ ml: 'auto', display: { xs: 'flex', sm: 'none' }, gap: 1, alignItems: 'center' }}>
              <ThemeToggle />
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'action.hover',
                  color: 'text.secondary',
                  border: '2px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                    color: 'text.primary',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12h18M3 6h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </Box>
  );
};

export default Layout;
