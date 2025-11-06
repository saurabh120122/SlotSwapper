import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Simple styling
const layoutStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem',
  padding: '1rem',
};
const eventListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};
const eventCardStyle = {
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
};
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '1rem',
  border: '1px solid #eee',
  borderRadius: '8px',
};

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

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
    try {
      const response = await api.post('/events', newEvent); // POST /api/events
      setEvents([...events, response.data.data]); // Add new event to list
      setNewEvent({ title: '', startTime: '', endTime: '' }); // Reset form
      toast.success('Event created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };
  
  const handleFormChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
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

  if (loading) return <div>Loading your calendar...</div>;

  return (
    <div style={layoutStyle}>
      {/* ----- Column 1: Create Event ----- */}
      <div>
        <h2>Create New Event</h2>
        <form onSubmit={handleCreateEvent} style={formStyle}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={handleFormChange}
          />
          <label>Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={newEvent.startTime}
            onChange={handleFormChange}
          />
          <label>End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={newEvent.endTime}
            onChange={handleFormChange}
          />
          <button type="submit">Create Event</button>
        </form>
      </div>

      {/* ----- Column 2: My Events ----- */}
      <div>
        <h2>My Events</h2>
        <div style={eventListStyle}>
          {events.length === 0 && <p>You have no events.</p>}
          {events.map(event => (
            <div key={event._id} style={eventCardStyle}>
              <h4>{event.title}</h4>
              <p>{new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
              <p><strong>Status: {event.status}</strong></p>
              
              {/* Logic for the status change buttons */}
              {event.status === 'BUSY' && (
                <button onClick={() => handleStatusChange(event._id, 'SWAPPABLE')}>
                  Make Swappable
                </button>
              )}
              {event.status === 'SWAPPABLE' && (
                <button onClick={() => handleStatusChange(event._id, 'BUSY')}>
                  Make Busy
                </button>
              )}
              {event.status === 'SWAP_PENDING' && (
                <button disabled>In a pending swap...</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;