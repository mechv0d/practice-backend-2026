import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { surveysAPI, questionsAPI, optionsAPI } from '../services/api';
import { Survey, Question, CreateQuestionData, QuestionType } from '../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';
import { keyframes } from '@mui/material/styles';

// Анимация падения вопроса
const fallDownAnimation = keyframes`
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(50px) scale(1);
    opacity: 0.0;
  }
  100% {
    transform: translateY(75px) scale(1);
    opacity: 0.0;
  }
`;

const EditSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('view') === 'true';

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [success, setSuccess] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isAddQuestionCollapsed, setIsAddQuestionCollapsed] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number | string>>(new Set());
  const [animatingQuestionIds, setAnimatingQuestionIds] = useState<Set<number | string>>(new Set());
  const [questionRotations, setQuestionRotations] = useState<Map<number | string, number>>(new Map());
  const [editQuestionData, setEditQuestionData] = useState<CreateQuestionData>({
    text: '',
    type: 'single_choice',
    order: 1,
    options: [''],
  });
  const [isEditingSurvey, setIsEditingSurvey] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [newQuestion, setNewQuestion] = useState<CreateQuestionData>({
    text: '',
    type: 'single_choice',
    order: 1,
    options: [''],
  });

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;

      try {
        const surveyData = await surveysAPI.getSurvey(Number(id));
        console.log('Fetched survey updated_at:', surveyData.updated_at);
        console.log('Fetched survey questions:', surveyData.questions);
        setSurvey(surveyData);
        setQuestions(surveyData.questions || []);
        setNewQuestion(prev => ({ ...prev, order: (surveyData.questions?.length || 0) + 1 }));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки опроса');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const isQuestionValid = () => {
    if (!newQuestion.text.trim()) return false;
    
    if (newQuestion.type !== 'text') {
      const options = newQuestion.options || [];
      const validOptions = options.filter(opt => opt.trim());
      return validOptions.length >= 2;
    }
    
    return true;
  };

  const isEditQuestionValid = () => {
    if (!editQuestionData.text.trim()) return false;
    
    if (editQuestionData.type !== 'text') {
      const options = editQuestionData.options || [];
      const validOptions = options.filter(opt => opt.trim());
      return validOptions.length >= 2;
    }
    
    return true;
  };

  const handleStartEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditQuestionData({
      text: question.text,
      type: question.type,
      order: question.order,
      options: question.options?.map(opt => opt.text) || ['']
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestionData({
      text: '',
      type: 'single_choice',
      order: 1,
      options: [''],
    });
  };

  const handleSaveEditQuestion = async () => {
    if (!editingQuestionId) return;
    
    // Нельзя редактировать временные вопросы через API
    if (typeof editingQuestionId === 'string' && editingQuestionId.startsWith('temp-')) {
      setError('Нельзя сохранить временный вопрос через API');
      return;
    }

    setIsSavingEdit(true);
    setError('');

    try {
      const questionData = {
        ...editQuestionData,
        options: editQuestionData.type !== 'text' ? editQuestionData.options?.filter(opt => opt.trim()) : undefined
      };

      const updatedQuestion = await questionsAPI.updateQuestion(editingQuestionId as number, questionData);
      
      // Извлекаем обновленный вопрос из ответа API
      const actualUpdatedQuestion = updatedQuestion.data?.question || updatedQuestion;
      
      setQuestions(questions.map(q => 
        q.id === editingQuestionId 
          ? { 
              ...actualUpdatedQuestion,
              text: questionData.text, 
              type: questionData.type,
              options: (questionData.options || []).map((text, index) => ({
                id: actualUpdatedQuestion.options?.[index]?.id || q.options?.[index]?.id || `temp-question-${Date.now()}-${index}`,
                text
              }))
            }
          : q
      ));
      
      // Обновляем время последнего изменения опроса
      if (survey) {
        setSurvey({
          ...survey,
          updated_at: new Date().toISOString()
        });
      }
      
      setEditingQuestionId(null);
      setSuccess('Вопрос успешно обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления вопроса');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditOptionChange = (index: number, value: string) => {
    const currentOptions = editQuestionData.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setEditQuestionData({ ...editQuestionData, options: newOptions });
  };

  const addEditOptionField = () => {
    const currentOptions = editQuestionData.options || [];
    setEditQuestionData({ ...editQuestionData, options: [...currentOptions, ''] });
  };

  const removeEditOptionField = (index: number) => {
    const currentOptions = editQuestionData.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    setEditQuestionData({ ...editQuestionData, options: newOptions });
  };

  const toggleQuestionExpanded = (questionId: number | string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleAddQuestion = async () => {
    if (!id || !newQuestion.text.trim() || !isQuestionValid()) return;

    setIsCreatingQuestion(true);
    setError('');

    try {
      const questionData = {
        ...newQuestion,
        options: newQuestion.type !== 'text' ? newQuestion.options?.filter(opt => opt.trim()) : undefined
      };

      const createdQuestion = await questionsAPI.createQuestion(Number(id), questionData);
      
      // Извлекаем созданный вопрос
      const actualQuestion = createdQuestion.data?.question || createdQuestion;
      
      // Если вопрос требует опций, создаем их
      let questionOptions = [];
      if (questionData.options && questionData.options.length > 0) {
        questionOptions = await Promise.all(
          questionData.options.map(async (optionText, index) => {
            try {
              const optionResponse = await optionsAPI.createOption(actualQuestion.id, optionText);
              return optionResponse.data?.option || { id: `temp-${Date.now()}-${index}`, text: optionText };
            } catch (error) {
              console.error('Failed to create option:', optionText, error);
              return { id: `temp-${Date.now()}-${index}`, text: optionText };
            }
          })
        );
      }
      
      // Создаем полный вопрос с опциями
      const questionWithData = {
        ...actualQuestion,
        text: questionData.text,
        type: questionData.type,
        options: questionOptions
      };
      
      setQuestions([...questions, questionWithData]);
      
      // Очищаем форму при успехе
      setNewQuestion({
        text: '',
        type: 'single_choice',
        order: questions.length + 2,
        options: [''],
      });
      setIsAddQuestionCollapsed(false);
      
      // Обновляем время последнего изменения опроса
      if (survey) {
        setSurvey({
          ...survey,
          updated_at: new Date().toISOString()
        });
      }
      
      setSuccess('Вопрос успешно добавлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка добавления вопроса');
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number | string) => {
    console.log('Deleting question with ID:', questionId, 'Type:', typeof questionId);
    
    setDeletingQuestionId(questionId);
    setError('');

    try {
      // Если вопрос имеет временный ID, просто удаляем его из локального состояния
      if (typeof questionId === 'string' && questionId.startsWith('temp-')) {
        // Генерируем случайный поворот для этого вопроса
        const randomRotation = Math.floor(Math.random() * 61) - 30; // от -30 до 30
        setQuestionRotations(prev => new Map(prev).set(questionId, randomRotation));
        
        // Выполняем удаление
        setQuestions(questions.filter(q => q.id !== questionId));
        setDeleteMessage('Вопрос успешно удален');
        
        // Обновляем время последнего изменения опроса
        if (survey) {
          setSurvey({
            ...survey,
            updated_at: new Date().toISOString()
          });
        }
        
        setTimeout(() => setDeleteMessage(''), 3000);
        setDeletingQuestionId(null);
        return;
      }

      // Выполняем API запрос на удаление
      await questionsAPI.deleteQuestion(questionId as number);
      
      // Генерируем случайный поворот для этого вопроса
      const randomRotation = Math.floor(Math.random() * 61) - 30; // от -30 до 30
      setQuestionRotations(prev => new Map(prev).set(questionId, randomRotation));
      
      // Запускаем анимацию после успешного удаления
      setAnimatingQuestionIds(prev => new Set(prev).add(questionId));
      
      // Ждем завершения анимации
      setTimeout(() => {
        setQuestions(questions.filter(q => q.id !== questionId));
        setAnimatingQuestionIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
        setQuestionRotations(prev => {
          const newMap = new Map(prev);
          newMap.delete(questionId);
          return newMap;
        });
        setDeleteMessage('Вопрос успешно удален');
        
        // Обновляем время последнего изменения опроса
        if (survey) {
          setSurvey({
            ...survey,
            updated_at: new Date().toISOString()
          });
        }
        
        setTimeout(() => setDeleteMessage(''), 3000);
      }, 500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления вопроса');
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handlePublish = async () => {
    if (!id) return;

    setIsPublishing(true);
    try {
      await surveysAPI.publishSurvey(Number(id));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка публикации опроса');
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false);
    }
  };

  const handleStartEditSurvey = () => {
    if (survey) {
      setEditTitle(survey.title);
      setEditDescription(survey.description || '');
      setIsEditingSurvey(true);
    }
  };

  const handleCancelEditSurvey = () => {
    setIsEditingSurvey(false);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveSurvey = async () => {
    if (!id || !survey) return;

    setIsSaving(true);
    setError('');
    try {
      const updatedSurvey = await surveysAPI.updateSurvey(Number(id), {
        title: editTitle,
        description: editDescription,
      });
      setSurvey(updatedSurvey);
      setIsEditingSurvey(false);
      setSuccess('Опрос успешно обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления опроса');
    } finally {
      setIsSaving(false);
    }
  };

  const isSurveyDataChanged = survey && (
    editTitle.trim() !== survey.title || 
    editDescription.trim() !== (survey.description || '')
  );

  const addOptionField = () => {
    const currentOptions = newQuestion.options || [];
    setNewQuestion({ ...newQuestion, options: [...currentOptions, ''] });
  };

  const removeOptionField = (index: number) => {
    const currentOptions = newQuestion.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleOptionChange = (index: number, value: string) => {
    const currentOptions = newQuestion.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !survey) {
    return <Alert severity="error">{error || 'Опрос не найден'}</Alert>;
  }

  if (survey.status !== 'draft' && !isViewMode) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', mb: 2 }}>
          Опрос опубликован
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6 }}>
          Редактирование структуры опубликованного опроса невозможно
        </Typography>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="contained"
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Вернуться к опросам
        </Button>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        {isEditingSurvey ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'grey.700', minWidth: 'fit-content' }}>
                Название опроса:
              </Typography>
              <TextField
                fullWidth
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'grey.700' }}>
                Описание опроса:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'grey.50'
                  }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                onClick={handleSaveSurvey}
                disabled={!isSurveyDataChanged || isSaving}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                    cursor: 'not-allowed'
                  }
                }}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <IconButton
                onClick={handleCancelEditSurvey}
                size="small"
                sx={{
                  color: 'grey.500',
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: 'rgba(239, 68, 68, 0.04)'
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {isViewMode ? 'Просмотр опроса: ' : 'Редактирование опроса: '}{survey.title}
              </Typography>
              {!isViewMode && (
                <IconButton
                  onClick={handleStartEditSurvey}
                  size="medium"
                  sx={{
                    color: 'grey.500',
                    width: 48,
                    height: 48,
                    borderRadius: '8px',
                    '&:hover': {
                      color: 'grey.700',
                      backgroundColor: 'grey.100'
                    }
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
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              )}
            </Box>
            <Typography variant="body1" sx={{ color: 'grey.600', mt: 1 }}>
              {survey.description}
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Collapse in={!!success} timeout={300}>
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      </Collapse>

      <Collapse in={!!deleteMessage} timeout={300}>
        <Alert severity="info" sx={{ mb: 3 }}>
          {deleteMessage}
        </Alert>
      </Collapse>

      <Paper sx={{ mb: 4, border: '2px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
              Вопросы
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.500' }}>
              Последнее изменение: {new Date(survey.updated_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {questions.map((question, index) => {
              const rotation = questionRotations.get(question.id) || 0;
              const isAnimating = animatingQuestionIds.has(question.id);
              
              return (
              <Paper
                key={question.id || `question-${index}`}
                sx={{ 
                  p: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  transition: isAnimating 
                    ? 'none' 
                    : 'all 0.2s ease-in-out',
                  '&:hover': isAnimating 
                    ? {} 
                    : {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                  ...(isAnimating && {
                    animation: `${fallDownAnimation} 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                    transform: `rotate(${rotation}deg)`,
                    pointerEvents: 'none',
                    zIndex: 1000,
                    position: 'relative'
                  })
                }}
              >
                {editingQuestionId === question.id ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                        Редактирование вопроса {index + 1}
                      </Typography>
                      <IconButton
                        onClick={handleCancelEditQuestion}
                        size="small"
                        sx={{
                          color: 'grey.500',
                          '&:hover': {
                            color: 'error.main',
                            backgroundColor: 'rgba(239, 68, 68, 0.04)'
                          }
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </IconButton>
                    </Box>

                    <TextField
                      label="Текст вопроса"
                      value={editQuestionData.text}
                      onChange={(e) => setEditQuestionData({ ...editQuestionData, text: e.target.value })}
                      placeholder="Введите текст вопроса"
                    />

                    <TextField
                      select
                      label="Тип вопроса"
                      value={editQuestionData.type}
                      onChange={(e) => setEditQuestionData({
                        ...editQuestionData,
                        type: e.target.value as QuestionType,
                        options: e.target.value === 'text' ? [] : editQuestionData.options || ['']
                      })}
                    >
                      <MenuItem value="single_choice" key="single-choice-edit">Одиночный выбор</MenuItem>
                      <MenuItem value="multiple_choice" key="multiple-choice-edit">Множественный выбор</MenuItem>
                      <MenuItem value="text" key="text-edit">Текстовый ответ</MenuItem>
                    </TextField>

                    {editQuestionData.type !== 'text' && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.primary' }}>
                          Варианты ответов (минимум 2)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {(editQuestionData.options || []).map((option, index) => (
                            <Box key={`edit-option-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                value={option}
                                onChange={(e) => handleEditOptionChange(index, e.target.value)}
                                placeholder={`Вариант ${index + 1}`}
                                InputProps={{
                                  endAdornment: (editQuestionData.options || []).length > 1 && (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => removeEditOptionField(index)}
                                        size="small"
                                        sx={{ 
                                          color: 'error.main',
                                          width: 32,
                                          height: 32,
                                          borderRadius: '50%',
                                          border: '2px solid',
                                          borderColor: 'transparent',
                                          backgroundColor: 'transparent',
                                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                          transform: 'scale(1.33)',
                                          '&:hover': {
                                            backgroundColor: 'error.main',
                                            color: 'white',
                                            borderColor: 'error.main',
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                          },
                                          '&:active': {
                                            transform: 'scale(0.95)',
                                          }
                                        }}
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                        <Button
                          onClick={addEditOptionField}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            mt: 2, 
                            color: 'primary.main',
                            borderColor: 'transparent',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'rgba(79, 70, 229, 0.04)',
                              color: 'primary.main',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                            }
                          }}
                        >
                          + Добавить вариант
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        onClick={handleCancelEditQuestion}
                        variant="outlined"
                        sx={{
                          color: 'text.secondary',
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'action.focus',
                          }
                        }}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleSaveEditQuestion}
                        disabled={!isEditQuestionValid() || isSavingEdit}
                        variant="contained"
                        sx={{
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '&:disabled': {
                            bgcolor: 'grey.300',
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        {isSavingEdit ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer' }}
                        onClick={() => toggleQuestionExpanded(question.id)}
                      >
                        <Typography variant="caption" sx={{ color: 'grey.500' }}>
                          Вопрос {index + 1}
                        </Typography>
                        <Chip
                          label={getQuestionTypeLabel(question.type)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            transition: 'transform 0.2s ease',
                            transform: expandedQuestions.has(question.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <path
                            d="M19 9l-7 7-7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                      <Typography variant="body1" sx={{ color: 'text.primary' }}>
                        {question.text || 'Без текста вопроса'}
                      </Typography>
                      
                      <Collapse in={expandedQuestions.has(question.id)} timeout={200}>
                        <Box sx={{ mt: 2 }}>
                          {question.type === 'text' ? (
                            <Typography variant="body2" sx={{ color: 'grey.600', fontStyle: 'italic' }}>
                              Это текстовый ответ.
                            </Typography>
                          ) : question.options && question.options.length > 0 ? (
                            question.options.map((option) => (
                              <Typography
                                key={option.id}
                                variant="body2"
                                sx={{ color: 'grey.600', ml: 2 }}
                              >
                                • {option.text || 'Без текста варианта'}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" sx={{ color: 'grey.600', fontStyle: 'italic' }}>
                              Нет вариантов ответа
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                    {!isViewMode && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={deletingQuestionId === question.id}
                        size="small"
                        sx={{ 
                          color: 'error.main', 
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'transparent',
                          backgroundColor: 'transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: 'scale(1.15)',
                          '&:hover': {
                            backgroundColor: 'error.main',
                            color: 'white',
                            borderColor: 'error.main',
                            transform: 'scale(1)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                          },
                          '&:disabled': {
                            opacity: 0.6,
                            cursor: 'not-allowed'
                          },
                          '&:active': {
                            transform: 'scale(0.95)',
                          }
                        }}
                      >
                        {deletingQuestionId === question.id ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleStartEditQuestion(question)}
                        size="small"
                        sx={{ 
                          color: 'primary.main', 
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'transparent',
                          backgroundColor: 'transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: 'scale(1.15)',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderColor: 'primary.main',
                            transform: 'scale(1)',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                          },
                          '&:active': {
                            transform: 'scale(0.95)',
                          }
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </IconButton>
                    </Box>
                    )}
                  </Box>
                )}
              </Paper>
              );
            })}

            {isCreatingQuestion && (
              <Paper
                sx={{ 
                  p: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  opacity: 0.7
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="rectangular" width={120} height={24} />
                  <CircularProgress size={20} />
                </Box>
                <Skeleton variant="text" height={24} />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </Box>
              </Paper>
            )}

            {!isViewMode && (
            <Paper
              sx={{ 
                p: isAddQuestionCollapsed ? '24px 24px 0 24px' : 3, 
                border: '2px dashed',
                boxShadow: 'none',
                borderColor: isAddQuestionCollapsed ? 'divider' : 'divider',
                bgcolor: isAddQuestionCollapsed ? 'background.paper' : 'background.paper',
                cursor: isAddQuestionCollapsed ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                ...(isAddQuestionCollapsed && {
                  '&:hover': {
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                    bgcolor: 'background.paper',
                    transform: 'scale(1.005) translateY(-2px)',
                    borderColor: 'action.focus',
                  }
                }),
                ...(isAddQuestionCollapsed && {
                  '&:active': {
                    transform: 'scale(1.01)',
                    transition: 'transform 0.1s ease',
                    borderColor: 'action.focus',
                  }
                })
              }}
              onClick={() => isAddQuestionCollapsed && setIsAddQuestionCollapsed(false)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                  Добавить новый вопрос
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddQuestionCollapsed(!isAddQuestionCollapsed);
                  }}
                  sx={{
                    transition: 'transform 0.3s ease',
                    transform: isAddQuestionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                    color: 'text.secondary'
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              </Box>

              <Collapse in={!isAddQuestionCollapsed} timeout={200}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  transition: 'opacity 0.2s ease-in-out',
                  opacity: !isAddQuestionCollapsed ? 1 : 0
                }}>
                  <TextField
                    label="Текст вопроса"
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                    placeholder="Введите текст вопроса"
                  />

                  <TextField
                    select
                    label="Тип вопроса"
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({
                      ...newQuestion,
                      type: e.target.value as QuestionType,
                      options: e.target.value === 'text' ? [] : ['']
                    })}
                  >
                    <MenuItem value="single_choice" key="single-choice-new">Одиночный выбор</MenuItem>
                    <MenuItem value="multiple_choice" key="multiple-choice-new">Множественный выбор</MenuItem>
                    <MenuItem value="text" key="text-new">Текстовый ответ</MenuItem>
                  </TextField>

                  {newQuestion.type !== 'text' && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.primary' }}>
                        Варианты ответов (минимум 2)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(newQuestion.options || []).map((option, index) => (
                          <Box key={`new-option-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Вариант ${index + 1}`}
                              InputProps={{
                                endAdornment: (newQuestion.options || []).length > 1 && (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => removeOptionField(index)}
                                      size="small"
                                      sx={{ 
                                        color: 'error.main',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        border: '2px solid',
                                        borderColor: 'transparent',
                                        backgroundColor: 'transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: 'scale(1.33)',
                                        '&:hover': {
                                          backgroundColor: 'error.main',
                                          color: 'white',
                                          borderColor: 'error.main',
                                          transform: 'scale(1.05)',
                                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                        },
                                        '&:active': {
                                          transform: 'scale(0.95)',
                                        }
                                      }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                      <Button
                        onClick={addOptionField}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          mt: 2, 
                          color: 'primary.main',
                          borderColor: 'transparent',
                          backgroundColor: 'transparent',
                          borderWidth: 2,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(79, 70, 229, 0.04)',
                            color: 'primary.main',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                          }
                        }}
                      >
                        + Добавить вариант
                      </Button>
                    </Box>
                  )}

                  <Button
                    onClick={handleAddQuestion}
                    disabled={!isQuestionValid() || isCreatingQuestion}
                    variant="contained"
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': {
                        bgcolor: 'grey.300',
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    {isCreatingQuestion ? 'Добавление...' : 'Добавить вопрос'}
                  </Button>
                </Box>
              </Collapse>
            </Paper>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outlined"
          sx={{
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'action.focus',
            }
          }}
        >
          К опросам
        </Button>
        {!isViewMode && (
          <Button
            onClick={() => setShowPublishDialog(true)}
            disabled={questions.length === 0 || isPublishing}
            variant="contained"
            sx={{
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
              '&:disabled': {
                // bgcolor: 'grey.300',
                cursor: 'not-allowed'
              }
            }}
          >
            {isPublishing ? 'Публикация...' : 'Опубликовать опрос'}
          </Button>
        )}
      </Box>
    </Box>

    {/* Модальное окно подтверждения публикации */}
    <Dialog 
      open={showPublishDialog} 
      onClose={() => setShowPublishDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Подтверждение публикации</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Вы уверены, что хотите опубликовать опрос "{survey?.title}"?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          После публикации опрос станет доступен для прохождения, и вы больше не сможете изменять его структуру (вопросы и варианты ответов).
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={() => setShowPublishDialog(false)}
          variant="outlined"
          sx={{
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'action.focus',
            }
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handlePublish}
          disabled={isPublishing}
          variant="contained"
          sx={{
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' },
            '&:disabled': {
              bgcolor: 'grey.300',
              cursor: 'not-allowed'
            }
          }}
        >
          {isPublishing ? 'Публикация...' : 'Опубликовать'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default EditSurveyPage;
