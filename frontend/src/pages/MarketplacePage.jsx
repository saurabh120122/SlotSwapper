import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Simple styling
const eventCardStyle = {
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  margin: '0.5rem 0',
};
const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'white',
  padding: '2rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  zIndex: 100,
};
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  zIndex: 99,
};

const MarketplacePage = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the swap modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // The slot I WANT
  const [myOfferingSlotId, setMyOfferingSlotId] = useState(''); // The slot I'M OFFERING

  // --- 1. Fetch data on load ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all slots from OTHER users
      const swappableRes = await api.get('/swappable-slots'); // GET /api/swappable-slots
      setSwappableSlots(swappableRes.data.data);
      
      // Get MY events to find which ones I can offer
      const myEventsRes = await api.get('/events');
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

  // --- 2. Handle opening the modal ---
  const handleRequestClick = (slot) => {
    if (mySwappableSlots.length === 0) {
      return toast.error("You have no swappable slots to offer!");
    }
    setSelectedSlot(slot); // Set the slot I want
    setMyOfferingSlotId(mySwappableSlots[0]._id); // Default to my first swappable slot
    setShowModal(true);
  };

  // --- 3. Handle submitting the swap request ---
  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/swap-request', {
        mySlotId: myOfferingSlotId,
        theirSlotId: selectedSlot._id,
      });
      toast.success('Swap request sent!');
      setShowModal(false);
      setSelectedSlot(null);
      // Refresh all data since my slot is now PENDING
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) return <div>Loading available slots...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Marketplace</h2>
      {swappableSlots.length === 0 && <p>No swappable slots available right now.</p>}
      
      {swappableSlots.map(slot => (
        <div key={slot._id} style={eventCardStyle}>
          <h4>{slot.title}</h4>
          <p>By: {slot.owner.name}</p>
          <p>{new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}</p>
          <button onClick={() => handleRequestClick(slot)}>
            Request Swap
          </button>
        </div>
      ))}

      {/* ----- Swap Request Modal ----- */}
      {showModal && (
        <>
          <div style={overlayStyle} onClick={() => setShowModal(false)} />
          <div style={modalStyle}>
            <h3>Request Swap</h3>
            <p>You want: <strong>{selectedSlot.title}</strong></p>
            <form onSubmit={handleSwapSubmit}>
              <label>Offer your slot:</label>
              <select
                value={myOfferingSlotId}
                onChange={(e) => setMyOfferingSlotId(e.target.value)}
              >
                {mySwappableSlots.map(mySlot => (
                  <option key={mySlot._id} value={mySlot._id}>
                    {mySlot.title} ({new Date(mySlot.startTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <button type="submit" style={{ marginLeft: '10px' }}>Send Request</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketplacePage;