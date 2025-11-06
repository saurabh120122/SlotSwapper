import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// --- MUI Imports ---
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const Layout = () => {
  const { isLoggedIn, logout, user } = useAuth();

  const handleLogout = async () => {
    // You can make this call an API endpoint if you want
    // For now, it just clears the local state
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* --- The New Professional App Bar --- */}
      <AppBar position="static">
        <Toolbar>
          {/* Logo/Title */}
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to={isLoggedIn ? "/dashboard" : "/"} 
            sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
          >
            SlotSwapper
          </Typography>

          {/* Nav Links */}
          {isLoggedIn ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
              <Button color="inherit" component={RouterLink} to="/marketplace">Marketplace</Button>
              <Button color="inherit" component={RouterLink} to="/requests">My Requests</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
              <Typography sx={{ ml: 2 }}>Hi, {user.name}!</Typography>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* --- Page Content --- */}
      {/* We use a Container to center the content and provide padding */}
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Outlet /> {/* This is where the current page renders */}
      </Container>
    </Box>
  );
};

export default Layout;