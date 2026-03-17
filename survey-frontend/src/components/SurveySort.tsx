import React, { useState, memo, useCallback } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { SurveyFilters as SurveyFiltersType } from '../types';

interface SurveySortProps {
  filters: SurveyFiltersType;
  onFilterChange: (filters: Partial<SurveyFiltersType>) => void;
}

const sortOptions = [
  { value: 'created_at', label: 'По дате создания' },
  { value: 'updated_at', label: 'По дате обновления' },
  { value: 'responses_count', label: 'По количеству ответов' },
];

const SurveySort: React.FC<SurveySortProps> = ({ filters, onFilterChange }) => {
  const theme = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSortByChange = (event: any) => {
    onFilterChange({ sort_by: event.target.value as SurveyFiltersType['sort_by'] });
  };

  const toggleSortOrder = () => {
    onFilterChange({ 
      sort_order: filters.sort_order === 'desc' ? 'asc' : 'desc' 
    });
  };

  const getSortIconRotation = () => {
    return filters.sort_order === 'asc' ? 180 : 0;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: { xs: 200, sm: 250 } }}>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: { xs: 160, sm: 200 },
          flex: 1
        }}
      >
        <InputLabel 
          id="sort-by-label"
          sx={{
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            transform: { xs: 'translate(12px, -9px) scale(0.85)', sm: 'translate(14px, -9px) scale(0.85)' },
            '&.Mui-focused': {
              transform: { xs: 'translate(12px, -9px) scale(0.85)', sm: 'translate(14px, -9px) scale(0.85)' },
            }
          }}
        >
          Сортировка
        </InputLabel>
        <Select
          labelId="sort-by-label"
          value={filters.sort_by}
          onChange={handleSortByChange}
          label="Сортировка"
          sx={{
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            '& .MuiSelect-select': {
              py: { xs: 1, sm: 1.5 }
            }
          }}
        >
          {sortOptions.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Tooltip 
        title={filters.sort_order === 'desc' ? 'По убыванию' : 'По возрастанию'}
        placement="top"
      >
        <IconButton
          onClick={toggleSortOrder}
          size="small"
          sx={{
            p: { xs: 1, sm: 1.5 },
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <SwapVertIcon
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              transform: `rotate(${getSortIconRotation()}deg)`,
              transition: 'transform 0.2s ease',
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default memo(SurveySort);
