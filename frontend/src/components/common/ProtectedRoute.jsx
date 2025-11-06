import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// This is the "bouncer" for your private pages
const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect them to the /login page, but save the location they were
    // trying to go to so we can send them there after they login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are logged in, render the child route (e.g., Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;