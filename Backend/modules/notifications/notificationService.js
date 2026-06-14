const { Notification, DELIVERY_STATUS } = require("./notificationSchema");
const UserNotificationState = require("./userNotificationState");
const User = require("../../model/registerUser/UserScehma.js")
class NotificationService {
  constructor(io) {
    this.io = io; // Inject socket.io instance
  }

  async createNotification(payload) {
    try {
      const notification = await Notification.create(payload);

      // Emit after successful persistence
      this.emitNotification(notification);

      return notification;
    } catch (error) {
      // Handle duplicate index error silently if needed
      // if (error.code === 11000) {
      //   return null;
      // }

      if (error.code === 11000) {
        console.warn("Duplicate notification prevented");
        return null;
      }
      throw error;
    }
  }

  // emitNotification(notification) {
  //   if (!this.io) return;

  //   const room = `user:${notification.recipient}`;

  //   this.io.to(room).emit("notification:new", notification);

  //   // Optionally update delivery state
  //   Notification.updateOne(
  //     { _id: notification._id },
  //     {
  //       status: DELIVERY_STATUS.DELIVERED,
  //       deliveredAt: new Date(),
  //     },
  //   ).catch(() => {});
  // }

  emitNotification(notification) {
    if (!this.io) return;

    const room = `user:${notification.recipient}`;

    const sockets = this.io.sockets.adapter.rooms.get(room);

    if (sockets && sockets.size > 0) {
      this.io.to(room).emit("notification:new", notification);

      Notification.updateOne(
        { _id: notification._id },
        {
          status: DELIVERY_STATUS.DELIVERED,
          deliveredAt: new Date(),
        },
      ).catch(() => {});
    }
  }

  async getUserNotifications({ userId, cursor, limit = 20 }) {
    const query = {
      recipient: userId,
      isDeleted: false,
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    return Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name')
      .lean();
  }

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId) {
    return UserNotificationState.findOneAndUpdate(
      { user: userId },
      { lastReadAt: new Date() },
      { upsert: true, new: true },
    );
  }

  async getUnreadCount(userId) {
    const state = await UserNotificationState.findOne({ user: userId }).lean();

    const lastReadAt = state?.lastReadAt || new Date(0);

    return Notification.countDocuments({
      recipient: userId,
      createdAt: { $gt: lastReadAt },
      isDeleted: false,
    });
  }

  async replayMissedNotifications(userId, lastSeenAt) {
    //if (!lastSeenAt) return [];

    if (!lastSeenAt || isNaN(new Date(lastSeenAt))) return;

    return Notification.find({
      recipient: userId,
      createdAt: { $gt: new Date(lastSeenAt) },
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  async softDelete(notificationId, userId) {
    return Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { isDeleted: true },
    );
  }
}

module.exports = NotificationService;
