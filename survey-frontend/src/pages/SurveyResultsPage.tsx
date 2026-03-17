import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveysAPI } from '../services/api';
import { Survey, SurveyResults, TextAnswersResult } from '../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Memoized component moved outside to prevent recreation on every render
const MemoizedTextQuestion = React.memo(({ 
  result, 
  index, 
  textAnswersPages, 
  originalTextAnswers,
  searching, 
  searchTerms, 
  loadingMore, 
  handleSearch, 
  clearSearch, 
  loadMoreTextAnswers 
}: { 
  result: any; 
  index: number; 
  textAnswersPages: {[key: number]: TextAnswersResult};
  originalTextAnswers: {[key: number]: TextAnswersResult};
  searching: {[key: number]: boolean};
  searchTerms: {[key: number]: string};
  loadingMore: {[key: number]: boolean};
  handleSearch: (questionId: number, searchTerm: string) => void;
  clearSearch: (questionId: number) => void;
  loadMoreTextAnswers: (questionId: number) => void;
}) => {
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

  return (
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
            {result.options?.map((option: any) => (
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
              Текстовые ответы ({searchTerms[result.question_id] ? textAnswersPages[result.question_id]?.pagination.total || 0 : originalTextAnswers[result.question_id]?.pagination.total || result.text_answers?.length || 0}):
            </Typography>
            
            {/* Search field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Поиск по ответам..."
                value={searchTerms[result.question_id] || ''}
                onChange={(e) => handleSearch(result.question_id, e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </Box>
                  ),
                  endAdornment: searchTerms[result.question_id] && (
                    <IconButton
                      size="small"
                      onClick={() => clearSearch(result.question_id)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
            </Box>

            {/* Search results counter */}
            {searchTerms[result.question_id] && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
                Найдено: {textAnswersPages[result.question_id]?.pagination.total || 0} ответов
              </Typography>
            )}

            {/* Text answers list with overlay */}
            <Box sx={{ position: 'relative' }}>
              {searching[result.question_id] && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1,
                    borderRadius: 1
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Поиск ответов...
                  </Typography>
                </Box>
              )}

              {(textAnswersPages[result.question_id]?.answers || result.text_answers || []).length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    maxHeight: 256,
                    overflow: 'auto'
                  }}
                >
                  {(textAnswersPages[result.question_id]?.answers || result.text_answers || []).map((answer: any, answerIndex: number) => (
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
                  {searchTerms[result.question_id] ? 'Нет ответов, соответствующих поиску' : 'Нет текстовых ответов'}
                </Typography>
              )}
            </Box>

            {/* Show all answers button when searching */}
            {searchTerms[result.question_id] && (
              <Button
                size="small"
                onClick={() => clearSearch(result.question_id)}
                sx={{ mb: 1 }}
              >
                Показать все ответы
              </Button>
            )}

            {/* Load more button */}
            {textAnswersPages[result.question_id]?.pagination.has_more && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => loadMoreTextAnswers(result.question_id)}
                  disabled={loadingMore[result.question_id]}
                  startIcon={loadingMore[result.question_id] ? <CircularProgress size={16} /> : null}
                >
                  {loadingMore[result.question_id] 
                    ? 'Загрузка...' 
                    : `Загрузить еще (показано ${(textAnswersPages[result.question_id]?.answers || result.text_answers || []).length} из ${textAnswersPages[result.question_id]?.pagination.total || 0})`
                  }
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
});

MemoizedTextQuestion.displayName = 'MemoizedTextQuestion';

const SurveyResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // State for text answers pagination and search
  const [textAnswersPages, setTextAnswersPages] = useState<{[key: number]: TextAnswersResult}>({});
  const [originalTextAnswers, setOriginalTextAnswers] = useState<{[key: number]: TextAnswersResult}>({});
  const [searchTerms, setSearchTerms] = useState<{[key: number]: string}>({});
  const [loadingMore, setLoadingMore] = useState<{[key: number]: boolean}>({});
  const [searchTimeouts, setSearchTimeouts] = useState<{[key: number]: NodeJS.Timeout}>({});
  const [searching, setSearching] = useState<{[key: number]: boolean}>({});
  const searchTimeoutsRef = useRef<{[key: number]: NodeJS.Timeout}>({});

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
        
        // Initialize text answers pages data
        const initialTextPages: {[key: number]: TextAnswersResult} = {};
        const initialOriginalPages: {[key: number]: TextAnswersResult} = {};
        resultsData.results.forEach(result => {
          if (result.question_type === 'text' && result.text_pagination) {
            const textData = {
              answers: result.text_answers || [],
              pagination: result.text_pagination
            };
            initialTextPages[result.question_id] = textData;
            initialOriginalPages[result.question_id] = textData;
          }
        });
        setTextAnswersPages(initialTextPages);
        setOriginalTextAnswers(initialOriginalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const loadMoreTextAnswers = useCallback(async (questionId: number) => {
    if (!id || loadingMore[questionId]) return;
    
    const currentPageData = textAnswersPages[questionId];
    if (!currentPageData?.pagination.has_more) return;

    setLoadingMore(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const result = await surveysAPI.getTextAnswers(
        Number(id), 
        questionId, 
        currentPageData.pagination.current_page + 1,
        searchTerms[questionId]
      );
      
      setTextAnswersPages(prev => ({
        ...prev,
        [questionId]: {
          ...result,
          answers: [...(prev[questionId]?.answers || []), ...result.answers]
        }
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки ответов');
    } finally {
      setLoadingMore(prev => ({ ...prev, [questionId]: false }));
    }
  }, [id, loadingMore, textAnswersPages, searchTerms, originalTextAnswers]);

  const handleSearch = useCallback((questionId: number, searchTerm: string) => {
    // Clear existing timeout
    if (searchTimeoutsRef.current[questionId]) {
      clearTimeout(searchTimeoutsRef.current[questionId]);
    }

    // Update search term immediately
    setSearchTerms(prev => ({ ...prev, [questionId]: searchTerm }));

    // Only search if there's actual text and user stopped typing
    if (searchTerm.trim()) {
      const timeout = setTimeout(async () => {
        if (!id) return;
        
        setSearching(prev => ({ ...prev, [questionId]: true }));
        
        try {
          const result = await surveysAPI.getTextAnswers(
            Number(id), 
            questionId, 
            1, 
            searchTerm
          );
          
          setTextAnswersPages(prev => ({
            ...prev,
            [questionId]: result
          }));
        } catch (err: any) {
          setError(err.response?.data?.message || 'Ошибка поиска ответов');
        } finally {
          setSearching(prev => ({ ...prev, [questionId]: false }));
        }
      }, 800); // Wait 800ms after user stops typing

      searchTimeoutsRef.current[questionId] = timeout;
    } else {
      // Clear search immediately if empty and restore original data
      setSearching(prev => ({ ...prev, [questionId]: false }));
      setTextAnswersPages(prev => ({
        ...prev,
        [questionId]: originalTextAnswers[questionId] || { answers: [], pagination: { current_page: 1, has_more: false, total: 0 } }
      }));
    }
  }, [id, originalTextAnswers]);

  useEffect(() => {
    return () => {
      // Cleanup all timeouts on unmount
      Object.values(searchTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const clearSearch = useCallback((questionId: number) => {
    handleSearch(questionId, '');
  }, [handleSearch]);

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
          <MemoizedTextQuestion 
            key={result.question_id}
            result={result}
            index={index}
            textAnswersPages={textAnswersPages}
            originalTextAnswers={originalTextAnswers}
            searching={searching}
            searchTerms={searchTerms}
            loadingMore={loadingMore}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            loadMoreTextAnswers={loadMoreTextAnswers}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SurveyResultsPage;
