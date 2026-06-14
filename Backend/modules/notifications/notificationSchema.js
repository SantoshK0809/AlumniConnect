const mongoose = require("mongoose");
const { Schema } = mongoose;

const NOTIFICATION_TYPES = Object.freeze({
  FRIEND_REQUEST_RECEIVED: "FRIEND_REQUEST_RECEIVED",
  FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST_ACCEPTED",
  NEW_MESSAGE: "NEW_MESSAGE",
  FEED_LIKE: "FEED_LIKE",
  FEED_COMMENT: "FEED_COMMENT",
  MENTION: "MENTION",
  SYSTEM_ALERT: "SYSTEM_ALERT",
  NEW_POST: "NEW_POST"
});

const ENTITY_TYPES = Object.freeze({
  MESSAGE: "MESSAGE",
  POST: "POST",
  FRIEND_REQUEST: "FRIEND_REQUEST",
  USER: "USER",
  SYSTEM: "SYSTEM"
});

const DELIVERY_STATUS = Object.freeze({
  PENDING: "PENDING",
  DELIVERED: "DELIVERED"
});

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    entityType: {
      type: String,
      enum: Object.values(ENTITY_TYPES),
      required: true
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },

    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING
    },

    deliveredAt: {
      type: Date,
      default: null
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

/* ========================
   INDEX STRATEGY
======================== */

// Primary pagination
notificationSchema.index(
  { recipient: 1, isDeleted: 1, createdAt: -1 }
);

// Dedupe
notificationSchema.index(
  { recipient: 1, sender: 1, entityId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "FEED_LIKE" }
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
  Notification,
  NOTIFICATION_TYPES,
  ENTITY_TYPES,
  DELIVERY_STATUS
};
