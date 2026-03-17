import { useState, useEffect, useCallback } from 'react';
import { surveysAPI } from '../services/api';
import { Survey, SurveyFilters, SurveyPagination, SurveyListParams } from '../types';

interface UseSurveysReturn {
  surveys: Survey[];
  isLoading: boolean;
  error: string;
  pagination: SurveyPagination;
  filters: SurveyFilters;
  setFilters: (filters: Partial<SurveyFilters>) => void;
  setPagination: (pagination: Partial<SurveyPagination>) => void;
  refetch: () => void;
}

export const useSurveys = (initialFilters?: Partial<SurveyFilters>): UseSurveysReturn => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<SurveyPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState<SurveyFilters>({
    filter: 'my',
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialFilters,
  });

  const fetchSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: SurveyListParams = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        filter: filters.filter,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      };
      
      const response = await surveysAPI.getMySurveys(params);
      setSurveys(response.data.surveys);
      setPagination(response.meta.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading surveys');
    } finally {
      setIsLoading(false);
    }
  }, [filters.filter, filters.sort_by, filters.sort_order, pagination.current_page, pagination.per_page]);

  const setFiltersHandler = useCallback((newFilters: Partial<SurveyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page on filter change
  }, []);

  const setPaginationHandler = useCallback((newPagination: Partial<SurveyPagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const refetch = useCallback(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    isLoading,
    error,
    pagination,
    filters,
    setFilters: setFiltersHandler,
    setPagination: setPaginationHandler,
    refetch,
  };
};
