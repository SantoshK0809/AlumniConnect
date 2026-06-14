const NotificationService = require("../notifications/notificationService.js");

class NotificationController {
  constructor(notificationService, io) {
    this.notificationService = notificationService;
    this.io = io;

    // Bind methods
    this.getNotifications = this.getNotifications.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
  }

  /*
   * GET NOTIFICATIONS (CURSOR PAGINATION)
   */

  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { cursor, limit } = req.query;

      const notifications = await this.notificationService.getUserNotifications(
        {
          userId,
          cursor,
          limit: Number(limit) || 20,
        },
      );

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      console.error("Get notifications error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  }

  /*
   * GET UNREAD COUNT
   */

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await this.notificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (err) {
      console.error("Unread count error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread count",
      });
    }
  }

  /*
   * MARK ALL AS READ
   */

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await this.notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (err) {
      console.error("Mark read error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notifications as read",
      });
    }
  }

  /*
   * MARK SINGLE NOTIFICATION AS READ
   */

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID required",
        });
      }

      const notification = await this.notificationService.markAsRead(
        notificationId,
        userId,
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: notification,
        message: "Notification marked as read",
      });
    } catch (err) {
      console.error("Mark read error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  }

  /*
   * DELETE NOTIFICATION (SOFT DELETE)
   */

  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID required",
        });
      }

      //   await this.notificationService.softDelete(
      //     notificationId,
      //     userId
      //   );

      this.io.to(`user:${userId}`).emit("notification:deleted", {
        notificationId,
      });

      return res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (err) {
      console.error("Delete notification error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }
  }
}

module.exports = NotificationController;
