import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// --- MUI Imports ---
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Modal, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress 
} from '@mui/material';

// --- Style for the MUI Modal ---
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4, // 'p' is padding
};

const MarketplacePage = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // The slot I WANT
  const [myOfferingSlotId, setMyOfferingSlotId] = useState(''); // The slot I'M OFFERING

  const fetchData = async () => {
    setLoading(true);
    try {
      const [swappableRes, myEventsRes] = await Promise.all([
        api.get('/swappable-slots'),
        api.get('/events')
      ]);
      
      setSwappableSlots(swappableRes.data.data);
      setMySwappableSlots(
        myEventsRes.data.data.filter(event => event.status === 'SWAPPABLE')
      );
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestClick = (slot) => {
    if (mySwappableSlots.length === 0) {
      return toast.error("You have no swappable slots to offer!");
    }
    setSelectedSlot(slot);
    setMyOfferingSlotId(mySwappableSlots[0]._id);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/swap-request', {
        mySlotId: myOfferingSlotId,
        theirSlotId: selectedSlot._id,
      });
      toast.success('Swap request sent!');
      handleCloseModal();
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto' }} />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Marketplace
      </Typography>
      {swappableSlots.length === 0 && <Typography>No swappable slots available right now.</Typography>}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {swappableSlots.map(slot => (
          <Card key={slot._id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{slot.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Offered by: {slot.owner.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" onClick={() => handleRequestClick(slot)}>
                Request Swap
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* --- The New MUI Modal --- */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
      >
        <Box sx={modalStyle} component="form" onSubmit={handleSwapSubmit}>
          <Typography variant="h6" component="h2">
            Request Swap
          </Typography>
          <Typography sx={{ mt: 2 }}>
            You want: <strong>{selectedSlot?.title}</strong>
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="offer-slot-label">Offer Your Slot</InputLabel>
            <Select
              labelId="offer-slot-label"
              value={myOfferingSlotId}
              label="Offer Your Slot"
              onChange={(e) => setMyOfferingSlotId(e.target.value)}
            >
              {mySwappableSlots.map(mySlot => (
                <MenuItem key={mySlot._id} value={mySlot._id}>
                  {mySlot.title} ({new Date(mySlot.startTime).toLocaleDateString()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained">Send Request</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MarketplacePage;