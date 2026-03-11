import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveysAPI } from '../services/api';
import { Survey, Answer } from '../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';

const TakeSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;

      try {
        const surveyData = await surveysAPI.getSurveyForm(Number(id));
        setSurvey(surveyData);

        const initialAnswers: Answer[] = (surveyData.questions || []).map(question => ({
          question_id: Number(question.id),
          value: question.type === 'multiple_choice' ? [] : '',
        }));
        setAnswers(initialAnswers);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки опроса');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleAnswerChange = (questionId: number, value: string | string[]) => {
    setAnswers(prev =>
      prev.map(answer =>
        answer.question_id === questionId
          ? { ...answer, value }
          : answer
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !id) return;

    const isValid = (survey.questions || []).every(question => {
      const answer = answers.find(a => a.question_id === question.id);
      if (!answer) return false;

      if (question.type === 'text') {
        return typeof answer.value === 'string' && answer.value.trim() !== '';
      } else if (question.type === 'single_choice') {
        return typeof answer.value === 'string' && answer.value !== '';
      } else if (question.type === 'multiple_choice') {
        return Array.isArray(answer.value) && answer.value.length > 0;
      }

      return false;
    });

    if (!isValid) {
      setError('Пожалуйста, ответьте на все вопросы');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await surveysAPI.submitResponse(Number(id), { answers });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки ответов');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Выберите один вариант';
      case 'multiple_choice':
        return 'Выберите несколько вариантов';
      case 'text':
        return 'Текстовый ответ';
      default:
        return '';
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

  if (submitted) {
    return (
      <Box sx={{ maxWidth: 'sm', mx: 'auto', textAlign: 'center', py: 12 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'success.light',
            color: 'success.main',
            mx: 'auto',
            mb: 3
          }}
        >
          <CheckCircleIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'grey.900', mb: 2 }}>
          Спасибо за участие!
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.600', mb: 6 }}>
          Ваши ответы успешно сохранены
        </Typography>
        <Button
          onClick={() => navigate('/')}
          variant="contained"
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Вернуться на главную
        </Button>
      </Box>
    );
  }

  if (!survey) return null;

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 2 }}>
          {survey.title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.600' }}>
          {survey.description}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(survey.questions || []).map((question, index) => {
            const answer = answers.find(a => a.question_id === question.id);

            return (
              <Paper key={question.id} elevation={3} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'grey.900', mb: 2 }}>
                    {index + 1}. {question.text}
                  </Typography>
                  <Chip
                    label={getQuestionTypeLabel(question.type)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                {question.type === 'single_choice' && question.options && (
                  <RadioGroup
                    value={answer?.value as string || ''}
                    onChange={(e) => handleAnswerChange(Number(question.id), e.target.value)}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {question.options.map((option) => (
                        <FormControlLabel
                          key={option.id}
                          value={option.id.toString()}
                          control={<Radio />}
                          label={option.text}
                          sx={{ mr: 0 }}
                        />
                      ))}
                    </Box>
                  </RadioGroup>
                )}

                {question.type === 'multiple_choice' && question.options && (
                  <FormGroup>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {question.options.map((option) => {
                        const answerValue = answer?.value;
                        const isChecked = Array.isArray(answerValue) &&
                          answerValue.includes(option.id.toString());

                        return (
                          <FormControlLabel
                            key={option.id}
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => {
                                  const answerValue = answer?.value;
                                  const currentValues = Array.isArray(answerValue) ? answerValue : [];
                                  if (e.target.checked) {
                                    handleAnswerChange(Number(question.id), [...currentValues, e.target.value]);
                                  } else {
                                    handleAnswerChange(Number(question.id), currentValues.filter(v => v !== e.target.value));
                                  }
                                }}
                                value={option.id.toString()}
                              />
                            }
                            label={option.text}
                            sx={{ mr: 0 }}
                          />
                        );
                      })}
                    </Box>
                  </FormGroup>
                )}

                {question.type === 'text' && (
                  <TextField
                    multiline
                    rows={4}
                    value={answer?.value as string || ''}
                    onChange={(e) => handleAnswerChange(Number(question.id), e.target.value)}
                    placeholder="Введите ваш ответ..."
                    fullWidth
                  />
                )}
              </Paper>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="outlined"
            sx={{
              color: 'grey.700',
              borderColor: 'grey.300',
              '&:hover': {
                bgcolor: 'grey.50',
                borderColor: 'grey.400'
              }
            }}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': {
                bgcolor: 'grey.300',
                cursor: 'not-allowed'
              }
            }}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить ответы'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TakeSurveyPage;
