import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// --- MUI Imports ---
import { Box, Typography, Button } from '@mui/material';

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        mt: 8,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Page Not Found!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Sorry, the page you are looking for does not exist.
      </Typography>
      <Button 
        variant="contained" 
        component={RouterLink} 
        to="/"
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;