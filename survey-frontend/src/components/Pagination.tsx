import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { SurveyPagination } from '../types';

interface PaginationProps {
  pagination: SurveyPagination;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  showPerPageSelector?: boolean;
}

const perPageOptions = [10, 20, 50];

const Pagination: React.FC<PaginationProps> = ({ 
  pagination, 
  onPageChange, 
  onPerPageChange,
  showPerPageSelector = true 
}) => {
  const theme = useTheme();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page && newPage !== pagination.current_page) {
      onPageChange(newPage);
    }
  };

  const handlePerPageChange = (event: any) => {
    const newPerPage = event.target.value;
    if (onPerPageChange) {
      onPerPageChange(newPerPage);
    }
  };

  // Generate page numbers to show
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const current = pagination.current_page;
    const last = pagination.last_page;
    const delta = 2; // Number of pages to show before and after current

    for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
      pages.push(i);
    }

    // Always show first page if not included
    if (pages.length > 0 && typeof pages[0] === 'number' && pages[0] > 1) {
      if (pages[0] > 2) {
        pages.unshift('...');
      }
      pages.unshift(1);
    }

    // Always show last page if not included
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      if (typeof lastPage === 'number' && lastPage < last) {
        if (lastPage < last - 1) {
          pages.push('...');
        }
        pages.push(last);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const getResultsText = () => {
    if (pagination.total === 0) {
      return 'Нет опросов';
    }
    const from = pagination.from || 0;
    const to = pagination.to || 0;
    return `Показано ${from}-${to} из ${pagination.total} опросов`;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 4,
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}
    >
      {/* Results count and per page selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
        >
          {getResultsText()}
        </Typography>
        
        {showPerPageSelector && onPerPageChange && (
          <FormControl 
            size="small" 
            sx={{ minWidth: 100 }}
          >
            <InputLabel 
              id="per-page-label"
              sx={{ fontSize: '0.8rem', transform: 'translate(12px, -6px) scale(0.85)' }}
            >
              На странице
            </InputLabel>
            <Select
              labelId="per-page-label"
              value={pagination.per_page}
              onChange={handlePerPageChange}
              label="На странице"
              sx={{ fontSize: '0.8rem' }}
            >
              {perPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Page navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => handlePageChange(1)}
          disabled={pagination.current_page === 1}
          size="small"
          sx={{ 
            p: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1rem', sm: '1.2rem' }
          }}
        >
          <FirstPageIcon />
        </IconButton>

        <IconButton
          onClick={() => handlePageChange(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
          size="small"
          sx={{ 
            p: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1rem', sm: '1.2rem' }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Page numbers */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <Typography
                key={`ellipsis-${index}`}
                variant="body2"
                color="text.secondary"
                sx={{ px: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                ...
              </Typography>
            ) : (
              <IconButton
                key={page}
                onClick={() => handlePageChange(page as number)}
                disabled={page === pagination.current_page}
                size="small"
                sx={{
                  minWidth: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  bgcolor: page === pagination.current_page ? 'primary.main' : 'transparent',
                  color: page === pagination.current_page ? 'primary.contrastText' : 'text.primary',
                  border: page === pagination.current_page ? 'none' : '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: page === pagination.current_page ? 'primary.dark' : 'action.hover',
                  },
                  '&:disabled': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              >
                {page}
              </IconButton>
            )
          ))}
        </Box>

        <IconButton
          onClick={() => handlePageChange(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.last_page}
          size="small"
          sx={{ 
            p: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1rem', sm: '1.2rem' }
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        <IconButton
          onClick={() => handlePageChange(pagination.last_page)}
          disabled={pagination.current_page === pagination.last_page}
          size="small"
          sx={{ 
            p: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1rem', sm: '1.2rem' }
          }}
        >
          <LastPageIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Pagination;
