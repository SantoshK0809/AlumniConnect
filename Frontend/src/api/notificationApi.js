import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api/notifications",
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all notifications for the user (with cursor-based pagination)
export const getNotifications = async (cursor = null, limit = 20) => {
  try {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    
    const res = await API.get("/", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const res = await API.get("/unread-count");
    return res.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const res = await API.patch("/read-all");
    return res.data;
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

// Mark a single notification as read
export const markAsRead = async (notificationId) => {
  try {
    const res = await API.patch(`/${notificationId}/read`);
    return res.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Delete a single notification
export const deleteNotification = async (notificationId) => {
  try {
    const res = await API.delete(`/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export default API;
