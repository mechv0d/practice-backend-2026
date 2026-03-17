import React, { memo, useCallback } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { SurveyFilters as SurveyFiltersType, SurveyPagination } from '../types';
import SurveyFilters from './SurveyFilters';
import SurveySort from './SurveySort';

interface SurveyListHeaderProps {
  filters: SurveyFiltersType;
  pagination: SurveyPagination;
  onFilterChange: (filters: Partial<SurveyFiltersType>) => void;
  onPerPageChange?: (perPage: number) => void;
}

const SurveyListHeader: React.FC<SurveyListHeaderProps> = ({ 
  filters, 
  pagination, 
  onFilterChange,
  onPerPageChange 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const getFilterLabel = () => {
    switch (filters.filter) {
      case 'published':
        return 'Опубликованные';
      case 'closed':
        return 'Закрытые';
      default:
        return 'Все';
    }
  };

  const getResultsCount = () => {
    if (pagination.total === 0) {
      return '0 опросов';
    }
    return `${pagination.total} ${pagination.total === 1 ? 'опрос' : pagination.total < 5 ? 'опроса' : 'опросов'}`;
  };

  return (
    <Box>
      {/* Main header with title and create button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Typography 
            variant={isSmall ? 'h5' : 'h4'} 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '2.125rem' }
            }}
          >
            {!isMobile ? getFilterLabel() : 'Опросы'}
          </Typography>
          {!isMobile && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              ({getResultsCount()})
            </Typography>
          )}
        </Box>
        
        {/* This will be handled by DashboardPage - keeping reference */}
      </Box>

      {/* Filters and sort controls */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 2, md: 3 },
        mb: 3
      }}>
        {/* Filter tabs - full width on mobile */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SurveyFilters 
            filters={filters} 
            onFilterChange={onFilterChange} 
          />
        </Box>

        {/* Sort controls - full width on mobile */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: { xs: 'space-between', md: 'flex-end' },
          gap: 2,
          minWidth: { xs: '100%', md: 'auto' },
          mt: { xs: 2, md: 0 }
        }}>
          {/* Results count on mobile */}
          {isMobile && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.8rem' }}
            >
              {getResultsCount()}
            </Typography>
          )}
          
          <SurveySort 
            filters={filters} 
            onFilterChange={onFilterChange} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default memo(SurveyListHeader);
