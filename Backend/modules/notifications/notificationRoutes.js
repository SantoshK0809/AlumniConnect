const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const notificationService = require("./notificationService.js");
const NotificationController = require("./notificationController.js");

// Create a function to set up routes with controller (which will receive io from app.js)
const setupNotificationRoutes = (controller) => {
  router.get("/", verifyToken, controller.getNotifications);
  router.get("/unread-count", verifyToken, controller.getUnreadCount);
  router.patch("/read-all", verifyToken, controller.markAllAsRead);
  router.patch("/:notificationId/read", verifyToken, controller.markAsRead);
  router.delete("/:notificationId", verifyToken, controller.deleteNotification);
};

module.exports = { router, setupNotificationRoutes, NotificationController };
