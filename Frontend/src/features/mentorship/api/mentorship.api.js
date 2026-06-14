import axios from "axios";
import server from "../../../../environment.js";

const mentorshipAPI = axios.create({
  baseURL: `${server}/api/mentorship-requests`,
  withCredentials: true,
});

// Attach token automatically
mentorshipAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
 Send Mentorship Request
*/

export const sendMentorshipRequest = async (payload) => {
  const response = await mentorshipAPI.post("/", payload);

  return response.data;
};

/*
 Get Received Requests
*/

export const getReceivedRequests = async () => {
  const response = await mentorshipAPI.get("/received");
  console.log("Received Requests Response:", response.data);
  return response.data;
};

/*
 Get Sent Requests
*/

export const getSentRequests = async () => {
  const response = await mentorshipAPI.get("/sent");

  return response.data;
};

/*
 Accept Request
*/

export const acceptMentorshipRequest = async (requestId) => {
  const response = await mentorshipAPI.patch(`/${requestId}/accept`);

  return response.data;
};

/*
 Reject Request
*/

export const rejectMentorshipRequest = async (requestId) => {
  const response = await mentorshipAPI.patch(`/${requestId}/reject`);

  return response.data;
};
