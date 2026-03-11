import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveysAPI } from '../services/api';
import { Survey } from '../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '../components/Modal';
import ActionsDropdown from '../components/ActionsDropdown';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import PageTitle from '../components/PageTitle';

const DashboardPage: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [surveyToPublish, setSurveyToPublish] = useState<{ id: number; title: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [surveyToClose, setSurveyToClose] = useState<{ id: number; title: string } | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const data = await surveysAPI.getMySurveys();
        setSurveys(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки опросов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleDeleteClick = (surveyId: number, surveyTitle: string) => {
    setSurveyToDelete({ id: surveyId, title: surveyTitle });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!surveyToDelete) return;

    setIsDeleting(true);
    try {
      await surveysAPI.deleteSurvey(surveyToDelete.id);
      setSurveys(surveys.filter(survey => survey.id !== surveyToDelete.id));
      setDeleteModalOpen(false);
      setSurveyToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления опроса');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSurveyToDelete(null);
  };

  const handlePublishClick = (surveyId: number, surveyTitle: string) => {
    setSurveyToPublish({ id: surveyId, title: surveyTitle });
    setPublishModalOpen(true);
  };

  const handlePublishConfirm = async () => {
    if (!surveyToPublish) return;

    setIsPublishing(true);
    try {
      await surveysAPI.publishSurvey(surveyToPublish.id);
      // Обновляем статус опроса в локальном состоянии
      setSurveys(surveys.map(survey => 
        survey.id === surveyToPublish.id 
          ? { ...survey, status: 'published' }
          : survey
      ));
      setPublishModalOpen(false);
      setSurveyToPublish(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка публикации опроса');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishCancel = () => {
    setPublishModalOpen(false);
    setSurveyToPublish(null);
  };

  const handleCloseClick = (surveyId: number, surveyTitle: string) => {
    setSurveyToClose({ id: surveyId, title: surveyTitle });
    setCloseModalOpen(true);
  };

  const handleCloseConfirm = async () => {
    if (!surveyToClose) return;

    setIsClosing(true);
    try {
      await surveysAPI.closeSurvey(surveyToClose.id);
      // Обновляем статус опроса в локальном состоянии
      setSurveys(surveys.map(survey => 
        survey.id === surveyToClose.id 
          ? { ...survey, status: 'closed' }
          : survey
      ));
      setCloseModalOpen(false);
      setSurveyToClose(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка закрытия опроса');
    } finally {
      setIsClosing(false);
    }
  };

  const handleCloseCancel = () => {
    setCloseModalOpen(false);
    setSurveyToClose(null);
  };

  const handleInfoModalClose = () => {
    setInfoModalOpen(false);
    setTimeout(() => {
      setInfoModalMessage('');
    }, 300);
  };

  const getQuestionWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'вопросов';
    }
    
    switch (lastDigit) {
      case 1:
        return 'вопрос';
      case 2:
      case 3:
      case 4:
        return 'вопроса';
      default:
        return 'вопросов';
    }
  };

  const getResponseWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'ответов';
    }
    
    switch (lastDigit) {
      case 1:
        return 'ответ';
      case 2:
      case 3:
      case 4:
        return 'ответа';
      default:
        return 'ответов';
    }
  };

  const getStatusChipProps = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'default', label: 'Черновик' };
      case 'published':
        return { color: 'success', label: 'Опубликовано' };
      case 'closed':
        return { color: 'error', label: 'Закрыто' };
      default:
        return { color: 'default', label: status };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 'lg', mx: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        <Button 
              variant='contained'
              // color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Вернуться обратно
            </Button>
      </Box>
    );
  }

  return (
    <>
      <PageTitle title="Мои опросы" description="Управление вашими опросами" />
      <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Мои опросы
        </Typography>
        <Button
          component={Link}
          to="/surveys/new"
          variant="contained"
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Добавить новый
        </Button>
      </Box>

      {surveys.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', mb: 2 }}>
            У вас пока нет опросов
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6 }}>
            Создайте свой первый опрос, чтобы начать собирать отзывы
          </Typography>
          <Button
            component={Link}
            to="/surveys/new"
            variant="contained"
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Создать опрос
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {surveys.map((survey) => {
            const statusProps = getStatusChipProps(survey.status);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={survey.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'medium', color: 'text.primary', flex: 1 }}
                        noWrap
                      >
                        {survey.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={statusProps.label}
                          color={statusProps.color as 'default' | 'success' | 'error'}
                          size="small"
                        />
                        <ActionsDropdown
                          surveyId={survey.id}
                          surveyStatus={survey.status}
                          surveyTitle={survey.title}
                          onDelete={survey.status === 'draft' ? handleDeleteClick : () => {
                            setInfoModalMessage('Удалять можно только черновики. Опубликованные и закрытые опросы удалять нельзя.');
                            setInfoModalOpen(true);
                          }}
                          onCopySuccess={() => setCopySuccess(true)}
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {survey.description || 'Описание отсутствует.'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption">
                          {survey.questions_count || survey.questions?.length || 0} {getQuestionWord(survey.questions_count || survey.questions?.length || 0)}
                        </Typography>
                        {survey.status !== 'draft' && (
                          <Typography variant="caption">
                            {survey.responses_count || 0} {getResponseWord(survey.responses_count || 0)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption">
                        {new Date(survey.created_at).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ bgcolor: 'action.hover', px: 2, pb: 2, justifyContent: 'flex-end' }}>
                    {survey.status === 'draft' && (
                      <>
                        <Button
                          onClick={() => handlePublishClick(survey.id, survey.title)}
                          size="small"
                          variant="contained"
                          disabled={!survey.questions_count && !survey.questions?.length}
                          sx={{ 
                            bgcolor: 'success.main',
                            '&:hover': { bgcolor: 'success.dark' },
                            '&:disabled': {
                              bgcolor: 'grey.300',
                              cursor: 'not-allowed'
                            },
                            transform: 'scale(1.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Опубликовать
                        </Button>
                      </>
                    )}
                    {(survey.status === 'published' || survey.status === 'closed') && (
                      <>
                        <Button
                          component={Link}
                          to={`/surveys/${survey.id}/results`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: 'transparent',
                            color: 'success.main',
                            '&:hover': {
                              borderColor: 'success.main',
                              transform: 'scale(1.03)'
                            }
                          }}
                        >
                          Результаты
                        </Button>
                        {survey.status === 'published' && (
                        <Button
                          component={Link}
                          to={`/surveys/${survey.id}/take`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: 'transparent',
                            color: 'info.main',
                            '&:hover': {
                              borderColor: 'info.main',
                              transform: 'scale(1.03)'
                            }
                          }}
                          target="_blank"
                        >
                          Пройти опрос
                        </Button>)}
                      </>
                    )}
                     {survey.status === 'published' && (
                          <Button
                            onClick={() => handleCloseClick(survey.id, survey.title)}
                            size="small"
                            variant="contained"
                            sx={{ 
                              bgcolor: 'error.main',
                              '&:hover': { bgcolor: 'error.dark' },
                              '&:disabled': {
                                bgcolor: 'grey.300',
                                cursor: 'not-allowed'
                              },
                              transform: 'scale(1.03)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Закрыть
                          </Button>
                        )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Модальное окно подтверждения удаления */}
      <Modal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Подтверждение удаления"
        maxWidth="sm"
        fullWidth
        actions={
          <>
            <Button 
              onClick={handleDeleteCancel}
              variant="outlined"
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={isDeleting}
              sx={{
                '&:hover': {
                  backgroundColor: 'error.dark'
                }
              }}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </>
        }
      >
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить опрос "{surveyToDelete?.title}"?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Это действие необратимо. Все данные опроса будут безвозвратно удалены.
          </Typography>
        </Box>
      </Modal>

      {/* Модальное окно подтверждения публикации */}
      <Dialog 
        open={publishModalOpen} 
        onClose={handlePublishCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение публикации</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы уверены, что хотите опубликовать опрос "{surveyToPublish?.title}"?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            После публикации опрос станет доступен для прохождения, и вы больше не сможете изменять его структуру (вопросы и варианты ответов).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handlePublishCancel}
            variant="outlined"
            disabled={isPublishing}
          >
            Отмена
          </Button>
          <Button
            onClick={handlePublishConfirm}
            variant="contained"
            disabled={isPublishing}
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

      {/* Модальное окно подтверждения закрытия */}
      <Dialog 
        open={closeModalOpen} 
        onClose={handleCloseCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение закрытия</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы уверены, что хотите закрыть опрос "{surveyToClose?.title}"?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            После закрытия опрос перестанет быть доступным для прохождения, но вы сможете просматривать результаты.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseCancel}
            variant="outlined"
            disabled={isClosing}
          >
            Отмена
          </Button>
          <Button
            onClick={handleCloseConfirm}
            variant="contained"
            color="error"
            disabled={isClosing}
            sx={{
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
          >
            {isClosing ? 'Закрытие...' : 'Закрыть'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Информационное модальное окно */}
      <Dialog 
        open={infoModalOpen} 
        onClose={handleInfoModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Информация
          <IconButton
            onClick={handleInfoModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {infoModalMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleInfoModalClose}
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Ссылка скопирована в буфер обмена"
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'success.main',
            color: 'white',
          }
        }}
      />
    </Box>
    </>
  );
};

export default DashboardPage;
