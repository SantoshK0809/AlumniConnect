import API from "./index";

const BASE = "/connections";

// Send a connection request
export async function sendConnectionRequest(recipientId) {
  const res = await API.post(`${BASE}/request/${recipientId}`);
  return res.data;
}

// Accept a connection request
export async function acceptConnectionRequest(requesterId) {
  const res = await API.patch(`${BASE}/accept/${requesterId}`);
  return res.data;
}

// Reject a connection request
export async function rejectConnectionRequest(requesterId) {
  const res = await API.patch(`${BASE}/reject/${requesterId}`);
  return res.data;
}

// Remove a friend
export async function removeFriend(friendId) {
  const res = await API.delete(`${BASE}/remove/${friendId}`);
  return res.data;
}

// Get suggestions (people you may know)
export async function getSuggestions() {
  const res = await API.get(`${BASE}/suggestions`);
  return res.data;
}

// Get accepted connections list
export async function getConnections() {
  const res = await API.get(`${BASE}/list`);
  return res.data;
}

// Get incoming pending requests
export async function getIncomingRequests() {
  const res = await API.get(`${BASE}/requests`);
  return res.data;
}
