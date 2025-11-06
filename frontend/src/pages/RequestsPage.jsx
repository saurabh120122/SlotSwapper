import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// --- MUI Imports ---
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const RequestsPage = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get('/swap-requests/incoming'),
        api.get('/swap-requests/outgoing')
      ]);
      setIncoming(incomingRes.data.data);
      setOutgoing(outgoingRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (requestId, accepted) => {
    try {
      await api.post(`/swap-response/${requestId}`, { accepted });
      toast.success(accepted ? 'Swap accepted!' : 'Swap rejected.');
      fetchRequests(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond');
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto' }} />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Requests
      </Typography>
      
      <Grid container spacing={4}>
        {/* --- Column 1: Incoming Requests --- */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="h2" gutterBottom>
            Incoming
          </Typography>
          {incoming.length === 0 ? (
            <Typography>No pending incoming requests.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {incoming.map(req => (
                <Card key={req._id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{req.requester.name} wants to swap:</Typography>
                    <List dense>
                      <ListItemText primary="Their Slot:" secondary={req.offeredSlot.title} />
                      <ListItemText primary="Your Slot:" secondary={req.requestedSlot.title} />
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button size="small" variant="contained" color="success" onClick={() => handleResponse(req._id, true)}>
                      Accept
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleResponse(req._id, false)}>
                      Reject
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* --- Column 2: Outgoing Requests --- */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="h2" gutterBottom>
            Outgoing
          </Typography>
          {outgoing.length === 0 ? (
            <Typography>No outgoing requests.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {outgoing.map(req => (
                <Card key={req._id} variant="outlined">
                  <CardContent>
                    <Typography>
                      You offered <strong>{req.receiver.name}</strong> your <strong>{req.offeredSlot.title}</strong> for their <strong>{req.requestedSlot.title}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Status: <strong>{req.status}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RequestsPage;