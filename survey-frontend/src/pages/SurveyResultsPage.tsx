import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveysAPI } from '../services/api';
import { Survey, SurveyResults } from '../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

const SurveyResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [surveyData, resultsData] = await Promise.all([
          surveysAPI.getSurvey(Number(id)),
          surveysAPI.getSurveyResults(Number(id))
        ]);

        setSurvey(surveyData);
        setResults(resultsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExport = async () => {
    if (!id) return;

    setIsExporting(true);
    try {
      const exportData = await surveysAPI.exportResults(Number(id));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-${id}-results.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка экспорта результатов');
    } finally {
      setIsExporting(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Одиночный выбор';
      case 'multiple_choice':
        return 'Множественный выбор';
      case 'text':
        return 'Текстовый ответ';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Активен';
      case 'closed':
        return 'Закрыт';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !survey) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!survey || !results) return null;

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Результаты опроса: {survey.title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {survey.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outlined"
            sx={{
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider'
              },
              '&:disabled': {
                bgcolor: 'action.disabled',
                cursor: 'not-allowed'
              }
            }}
          >
            {isExporting ? 'Экспорт...' : 'Экспорт JSON'}
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outlined"
            sx={{
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider'
              }
            }}
          >
            Назад
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
            Общая статистика
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {results.total_respondents}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Всего респондентов
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {results.results.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Вопросов
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  {getStatusLabel(survey.status)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Статус опроса
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {results.results.map((result, index) => (
          <Paper key={result.question_id} elevation={3}>
            <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                {index + 1}. {result.question_text}
              </Typography>
              <Chip
                label={getQuestionTypeLabel(result.question_type)}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ p: 3 }}>
              {result.options ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {result.options.map((option) => (
                    <Box key={option.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {option.text}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {option.count} ({option.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'divider', borderRadius: 2, height: 8 }}>
                        <Box
                          sx={{
                            bgcolor: 'primary.main',
                            height: 8,
                            borderRadius: 2,
                            width: `${option.percentage}%`
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'medium', color: 'text.primary', mb: 2 }}>
                    Текстовые ответы ({result.text_answers?.length || 0}):
                  </Typography>
                  {result.text_answers && result.text_answers.length > 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        maxHeight: 256,
                        overflow: 'auto'
                      }}
                    >
                      {result.text_answers.map((answer, answerIndex) => (
                        <Box
                          key={answerIndex}
                          sx={{
                            p: 1.5,
                            bgcolor: 'action.hover',
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            {answer}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Нет текстовых ответов
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SurveyResultsPage;
