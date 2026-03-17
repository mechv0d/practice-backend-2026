import React from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { UserRole } from '../types';
import CreateIcon from '@mui/icons-material/Create';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface RoleSelectorProps {
  value: UserRole | '';
  onChange: (role: UserRole) => void;
  error?: boolean;
  helperText?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, error, helperText }) => {
  const roles = [
    {
      key: 'author' as UserRole,
      title: 'Автор',
      description: 'Создавайте и управляйте опросами',
      icon: <CreateIcon />,
      color: '#4f46e5', // primary.main
    },
    {
      key: 'respondent' as UserRole,
      title: 'Респондент',
      description: 'Проходите опросы и делитесь мнением',
      icon: <AssignmentIcon />,
      color: '#16a34a', // secondary.main
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Выберите вашу роль
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        {roles.map((role) => (
          <Card
            key={role.key}
            onClick={() => onChange(role.key)}
            sx={{
              cursor: 'pointer',
              border: 2,
              borderColor: value === role.key ? role.color : 'grey.300',
              backgroundColor: value === role.key ? `${role.color}08` : 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: role.color,
                transform: 'translateY(-2px) scale(1.01)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              '&:active': {
                borderColor: role.color,
                transform: 'translateY(-2px) scale(0.95)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              flex: 1,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {value === role.key && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: role.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 1,
                }}
              >
                ✓
              </Box>
            )}
            
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <IconButton
                sx={{
                  mb: 2,
                  backgroundColor: value === role.key ? role.color : 'grey.200',
                  color: value === role.key ? 'white' : 'text.secondary',
                  width: 56,
                  height: 56,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: value === role.key ? role.color : 'grey.200',
                    transform: 'translateY(-1px) scale(1.05)',
                    color: value === role.key ? 'white' : role.color,
                    transition: 'all 0.2s ease', // as defined above pls
                  },
                }}
              >
                {role.icon}
              </IconButton>
              
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: value === role.key ? role.color : 'text.primary' }}>
                {role.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {role.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      
      {error && helperText && (
        <Typography variant="body2" color="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default RoleSelector;
