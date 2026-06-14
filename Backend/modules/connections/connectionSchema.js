const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "BLOCKED"],
      default: "PENDING",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate requests
 * A -> B can exist only once
 */
connectionSchema.index(
  { requesterId: 1, recipientId: 1 },
  { unique: true }
);

/**
 * Optimize common queries
 */
connectionSchema.index({ recipientId: 1, status: 1 });
connectionSchema.index({ requesterId: 1, status: 1 });

connectionSchema.pre("save", function (next) {
  if (this.requesterId.equals(this.recipientId)) {
    return next(new Error("Cannot send friend request to yourself"));
  }
  next();
});

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
