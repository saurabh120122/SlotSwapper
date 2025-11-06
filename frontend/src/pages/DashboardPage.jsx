import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// --- 1. IMPORT DAYJS AND THE PLUGIN ---
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// --- 2. REGISTER THE PLUGIN ---


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
  CircularProgress,
  Modal,
  IconButton
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
dayjs.extend(isSameOrBefore);
// Style for the Edit Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: '90vh', // Keep the scrollable modal
  overflowY: 'auto',
};

// --- 3. THE FIX: Define the Popper props to fix the popup ---
// This tells the calendar to use the 'viewport' (the whole screen)
// to decide where to place itself, "breaking out" of the modal.
const popperSlotProps = {
  popper: {
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
        },
      },
    ],
  },
};

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      return toast.error("All fields are required");
    }
    if (dayjs(endTime).isSameOrBefore(dayjs(startTime))) {
      return toast.error("End time must be after start time");
    }

    setIsCreating(true);
    try {
      const newEvent = { title, startTime, endTime };
      const response = await api.post('/events', newEvent);
      setEvents([...events, response.data.data]);
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

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const response = await api.patch(`/events/${eventId}/status`, { status: newStatus });
      setEvents(events.map(event => 
        event._id === eventId ? response.data.data : event
      ));
      toast.success(`Event status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
      toast.success('Event deleted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const openEditModal = (event) => {
    setSelectedEvent({
      ...event,
      startTime: dayjs(event.startTime), 
      endTime: dayjs(event.endTime)
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEditModalChange = (field, value) => {
    setSelectedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent.title || !selectedEvent.startTime || !selectedEvent.endTime) {
      return toast.error("All fields are required");
    }
    if (dayjs(selectedEvent.endTime).isSameOrBefore(dayjs(selectedEvent.startTime))) {
      return toast.error("End time must be after start time");
    }
    
    setIsEditing(true);
    try {
      const { _id, title, startTime, endTime } = selectedEvent;
      const updateData = { title, startTime, endTime };
      
      const response = await api.put(`/events/${_id}`, updateData);
      
      setEvents(events.map(event => 
        event._id === _id ? response.data.data : event
      ));
      
      toast.success('Event updated!');
      closeEditModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;

  return (
    <>
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
              closeOnSelect={false}
              slotProps={popperSlotProps} // <-- APPLY THE FIX
              desktopModeMediaQuery="@media (min-width: 2000px)"
            />
            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              renderInput={(params) => <TextField {...params} />}
              disabled={isCreating}
              closeOnSelect={false}
              slotProps={popperSlotProps} // <-- APPLY THE FIX
              desktopModeMediaQuery="@media (min-width: 2000px)"
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
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  {/* Status Buttons */}
                  <Box>
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
                  </Box>
                  {/* Edit/Delete Buttons */}
                  <Box>
                    <IconButton 
                      color="primary" 
                      onClick={() => openEditModal(event)} 
                      disabled={event.status === 'SWAP_PENDING'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteEvent(event._id)} 
                      disabled={event.status === 'SWAP_PENDING'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* --- Edit Event Modal --- */}
      <Modal open={editModalOpen} onClose={closeEditModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleEditSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Event</Typography>
            <IconButton onClick={closeEditModal}><CloseIcon /></IconButton>
          </Box>
          <TextField
            label="Event Title"
            variant="outlined"
            value={selectedEvent?.title || ''}
            onChange={(e) => handleEditModalChange('title', e.target.value)}
            disabled={isEditing}
          />
          <DateTimePicker
            label="Start Time"
            value={selectedEvent?.startTime || null}
            onChange={(newValue) => handleEditModalChange('startTime', newValue)}
            renderInput={(params) => <TextField {...params} />}
            disabled={isEditing}
            closeOnSelect={false}
            slotProps={popperSlotProps} // <-- APPLY THE FIX
            desktopModeMediaQuery="@media (min-width: 2000px)"
          />
          <DateTimePicker
            label="End Time"
            value={selectedEvent?.endTime || null}
            onChange={(newValue) => handleEditModalChange('endTime', newValue)}
            renderInput={(params) => <TextField {...params} />}
            disabled={isEditing}
            closeOnSelect={false}
            slotProps={popperSlotProps} // <-- APPLY THEK FIX
            desktopModeMediaQuery="@media (min-width: 2000px)"
          />
          <Button type="submit" variant="contained" disabled={isEditing}>
            {isEditing ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default DashboardPage;