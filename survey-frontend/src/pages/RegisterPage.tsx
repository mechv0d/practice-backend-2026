import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LinkMui from '@mui/material/Link';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData);
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Ошибка регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'extrabold', color: 'grey.900', mb: 2 }}>
              Регистрация
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Или{' '}
              <LinkMui
                component={Link}
                to="/login"
                sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' } }}
              >
                войдите в систему
              </LinkMui>
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              id="name"
              name="name"
              type="text"
              label="Имя"
              autoComplete="name"
              required
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              id="password"
              name="password"
              type="password"
              label="Пароль"
              autoComplete="new-password"
              required
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
            />

            <TextField
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              label="Подтверждение пароля"
              autoComplete="new-password"
              required
              fullWidth
              margin="normal"
              value={formData.password_confirmation}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': {
                  bgcolor: 'grey.300',
                  cursor: 'not-allowed'
                }
              }}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
