import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveysAPI } from '../services/api';
import { CreateSurveyData } from '../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import PageTitle from '../components/PageTitle';

const CreateSurveyPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateSurveyData>({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const survey = await surveysAPI.createSurvey(formData);
      navigate(`/surveys/${survey.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания опроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Создание опроса" description="Создание нового опроса" />
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.900' }}>
          Создание нового опроса
        </Typography>
      </Box>

      <Paper elevation={3}>
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              id="title"
              name="title"
              label="Название опроса"
              required
              fullWidth
              margin="normal"
              placeholder="Введите название опроса"
              value={formData.title}
              onChange={handleChange}
            />

            <TextField
              id="description"
              name="description"
              label="Описание"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              placeholder="Опишите, для чего предназначен этот опрос"
              value={formData.description}
              onChange={handleChange}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                type="button"
                onClick={() => navigate('/dashboard')}
                variant="outlined"
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.500' : 'grey.400'
                  }
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                    cursor: 'not-allowed'
                  }
                }}
              >
                {isLoading ? 'Создание...' : 'Создать опрос'}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
    </>
  );
};

export default CreateSurveyPage;
