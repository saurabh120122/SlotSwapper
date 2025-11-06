import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// --- Import a loading spinner ---
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
  // 1. Get both loading and isLoggedIn
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  // 2. If we're still checking, show a spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 3. If we're done loading and NOT logged in, redirect
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. If we're done loading and ARE logged in, show the page
  return <Outlet />;
};

export default ProtectedRoute;