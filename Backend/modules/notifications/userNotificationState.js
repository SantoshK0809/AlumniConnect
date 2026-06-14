const mongoose = require("mongoose");

const userNotificationStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    lastReadAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const UserNotificationState = mongoose.model(
  "UserNotificationState",
  userNotificationStateSchema
);

module.exports = UserNotificationState;
