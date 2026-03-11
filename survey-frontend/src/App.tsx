import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Lazy loaded components
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const CreateSurveyPage = React.lazy(() => import('./pages/CreateSurveyPage'));
const EditSurveyPage = React.lazy(() => import('./pages/EditSurveyPage'));
const TakeSurveyPage = React.lazy(() => import('./pages/TakeSurveyPage'));
const SurveyResultsPage = React.lazy(() => import('./pages/SurveyResultsPage'));

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route 
                  path="dashboard" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DashboardPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="surveys/new" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <CreateSurveyPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="surveys/:id/edit" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <EditSurveyPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="surveys/:id/take" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <TakeSurveyPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="surveys/:id/results" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <SurveyResultsPage />
                    </Suspense>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
