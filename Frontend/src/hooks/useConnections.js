import { useState } from 'react';
import axios from 'axios';

export const useConnections = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const sendConnectionRequest = async (recipientId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[useConnections] Sending request to recipient: ${recipientId}`);
      const response = await axios.post(`/api/connections/request/${recipientId}`, {}, {
        headers: getHeaders(),
        withCredentials: true
      });
      console.log(`[useConnections] Request response:`, response.data);
      return response.data;
    } catch (err) {
      console.error('[useConnections] Error sending connection request:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptConnectionRequest = async (requesterId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[useConnections] Accepting request from requester: ${requesterId}`);
      const response = await axios.patch(`/api/connections/accept/${requesterId}`, {}, {
        headers: getHeaders(),
        withCredentials: true
      });
      console.log(`[useConnections] Accept response:`, response.data);
      return response.data;
    } catch (err) {
      console.error('[useConnections] Error accepting connection request:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to accept request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectConnectionRequest = async (requesterId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[useConnections] Rejecting request from requester: ${requesterId}`);
      const response = await axios.patch(`/api/connections/reject/${requesterId}`, {}, {
        headers: getHeaders(),
        withCredentials: true
      });
      console.log(`[useConnections] Reject response:`, response.data);
      return response.data;
    } catch (err) {
      console.error('[useConnections] Error rejecting connection request:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to reject request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeConnection = async (friendId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[useConnections] Removing connection with friend: ${friendId}`);
      const response = await axios.delete(`/api/connections/remove/${friendId}`, {
        headers: getHeaders(),
        withCredentials: true
      });
      console.log(`[useConnections] Remove response:`, response.data);
      return response.data;
    } catch (err) {
      console.error('[useConnections] Error removing connection:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to remove connection');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    loading,
    error
  };
};
