const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // encryptedConversationKey: {
    //   value: { type: String, required: true },
    //   keyVersion: { type: Number, required: true },
    // },

    encryptedConversationKey: {
      iv: { type: String, required: true },
      content: { type: String, required: true },
      tag: { type: String, required: true },
      keyVersion: { type: Number, required: true },
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    deletedFor: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    unreadCount: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

// enforce 1-to-1 uniqueness
conversationSchema.pre("save", function (next) {
  this.participants.sort();
  next();
});

// conversationSchema.index({ participants: 1 }, { unique: true });

// Uniqueness ONLY for 1-to-1 conversations
conversationSchema.index(
  { participants: 1 },
  {
    unique: true,
    partialFilterExpression: { isGroup: false },
  }
);


const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
