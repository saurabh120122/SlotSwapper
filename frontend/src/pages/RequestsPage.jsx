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
const requestCardStyle = {
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  margin: '0.5rem 0',
};

const RequestsPage = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch both incoming and outgoing requests ---
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get('/swap-requests/incoming'), // GET /api/swap-requests/incoming
        api.get('/swap-requests/outgoing')  // GET /api/swap-requests/outgoing
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

  // --- 2. Handle responding (Accept/Reject) to an incoming request ---
  const handleResponse = async (requestId, accepted) => {
    try {
      await api.post(`/swap-response/${requestId}`, { accepted }); // POST /api/swap-response
      toast.success(accepted ? 'Swap accepted!' : 'Swap rejected.');
      // Refresh all requests
      fetchRequests(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond');
    }
  };

  if (loading) return <div>Loading your requests...</div>;

  return (
    <div style={layoutStyle}>
      {/* ----- Column 1: Incoming Requests ----- */}
      <div>
        <h2>Incoming Requests</h2>
        {incoming.length === 0 && <p>No pending requests.</p>}
        {incoming.map(req => (
          <div key={req._id} style={requestCardStyle}>
            <p><strong>{req.requester.name}</strong> wants to swap:</p>
            <ul>
              <li>
                <strong>Their Slot:</strong> {req.offeredSlot.title}
              </li>
              <li>
                <strong>Your Slot:</strong> {req.requestedSlot.title}
              </li>
            </ul>
            <button onClick={() => handleResponse(req._id, true)}>Accept</button>
            <button onClick={() => handleResponse(req._id, false)} style={{ marginLeft: '10px' }}>Reject</button>
          </div>
        ))}
      </div>

      {/* ----- Column 2: Outgoing Requests ----- */}
      <div>
        <h2>Outgoing Requests</h2>
        {outgoing.length === 0 && <p>No outgoing requests.</p>}
        {outgoing.map(req => (
          <div key={req._id} style={requestCardStyle}>
            <p>You offered {req.receiver.name} your <strong>{req.offeredSlot.title}</strong> for their <strong>{req.requestedSlot.title}</strong></p>
            <p><strong>Status: {req.status}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestsPage;