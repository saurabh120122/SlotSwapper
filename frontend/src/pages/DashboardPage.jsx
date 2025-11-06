import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// --- MUI Imports ---
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the new event form
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(null); // Use null for date pickers
  const [endTime, setEndTime] = useState(null); // Use null for date pickers
  const [isCreating, setIsCreating] = useState(false);

  // --- 1. Fetch all user events on page load ---
  const fetchEvents = async () => {
    try {
      const response = await api.get('/events'); // GET /api/events
      setEvents(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []); // Empty array means this runs once on mount

  // --- 2. Handle new event creation ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      return toast.error("All fields are required");
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return toast.error("End time must be after start time");
    }

    setIsCreating(true);
    try {
      const newEvent = { title, startTime, endTime };
      const response = await api.post('/events', newEvent); // POST /api/events
      
      setEvents([...events, response.data.data]); // Add new event to list
      
      // Reset form
      setTitle('');
      setStartTime(null);
      setEndTime(null);
      
      toast.success('Event created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  // --- 3. Handle changing an event's status ---
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const response = await api.patch(`/events/${eventId}/status`, { status: newStatus });
      // Update the status of the single event in our local state
      setEvents(events.map(event => 
        event._id === eventId ? response.data.data : event
      ));
      toast.success(`Event status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;

  return (
    <Grid container spacing={4}>
      {/* ----- Column 1: Create Event ----- */}
      <Grid item xs={12} md={4}>
        <Typography component="h2" variant="h5" gutterBottom>
          Create New Event
        </Typography>
        <Box component="form" onSubmit={handleCreateEvent} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Event Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isCreating}
          />
          <DateTimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            renderInput={(params) => <TextField {...params} />}
            disabled={isCreating}
          />
          <DateTimePicker
            label="End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            renderInput={(params) => <TextField {...params} />}
            disabled={isCreating}
          />
          <Button type="submit" variant="contained" disabled={isCreating}>
            {isCreating ? <CircularProgress size={24} /> : 'Create Event'}
          </Button>
        </Box>
      </Grid>

      {/* ----- Column 2: My Events ----- */}
      <Grid item xs={12} md={8}>
        <Typography component="h2" variant="h5" gutterBottom>
          My Events
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.length === 0 && <Typography>You have no events. Create one to get started!</Typography>}
          {events.map(event => (
            <Card key={event._id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Status: {event.status}
                </Typography>
              </CardContent>
              <CardActions>
                {event.status === 'BUSY' && (
                  <Button size="small" variant="outlined" onClick={() => handleStatusChange(event._id, 'SWAPPABLE')}>
                    Make Swappable
                  </Button>
                )}
                {event.status === 'SWAPPABLE' && (
                  <Button size="small" variant="outlined" onClick={() => handleStatusChange(event._id, 'BUSY')}>
                    Make Busy
                  </Button>
                )}
                {event.status === 'SWAP_PENDING' && (
                  <Button size="small" variant="outlined" disabled>
                    In a pending swap...
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;