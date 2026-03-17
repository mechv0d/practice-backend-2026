import React, { memo, useCallback } from 'react';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import { SurveyFilters as SurveyFiltersType } from '../types';

interface SurveyFiltersProps {
  filters: SurveyFiltersType;
  onFilterChange: (filters: Partial<SurveyFiltersType>) => void;
}

const SurveyFilters: React.FC<SurveyFiltersProps> = ({ filters, onFilterChange }) => {
  const theme = useTheme();

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: 'my' | 'published' | 'closed') => {
    onFilterChange({ filter: newValue });
  }, [onFilterChange]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={filters.filter}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            minHeight: 48,
            [theme.breakpoints.down('sm')]: {
              fontSize: '0.85rem',
              minHeight: 44,
            }
          },
          '& .Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 600,
          }
        }}
      >
        <Tab 
          label="Все" 
          value="my"
          sx={{ 
            minWidth: { xs: 60, sm: 80 },
            px: { xs: 1, sm: 2 }
          }}
        />
        <Tab 
          label="Опубликованные" 
          value="published"
          sx={{ 
            minWidth: { xs: 70, sm: 90 },
            px: { xs: 1, sm: 2 }
          }}
        />
        <Tab 
          label="Закрытые" 
          value="closed"
          sx={{ 
            minWidth: { xs: 85, sm: 110 },
            px: { xs: 1, sm: 2 }
          }}
        />
      </Tabs>
    </Box>
  );
};

export default memo(SurveyFilters);
