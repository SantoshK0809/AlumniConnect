const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    type: {
      type: String,
      enum: ["image", "document", "video", "audio", null],
      default: null,
    },
    name: { type: String, default: null },
    size: { type: Number, default: null },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    encryptedPayload: {
      iv: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      tag: {
        type: String,
        required: true
      }
    },

    attachment: {
      type: AttachmentSchema,
      default: null
    },

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    reactions: [
      {
        emoji: {
          type: String,
          required: true
        },
        userIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

// compound index for chat history loading
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
