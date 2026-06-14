const express = require("express");
const router = express.Router();
const {
  handleGetConversations,
  handleGetMessages,
  handlePostMessage,
  handleSeenConversation,
  handleReaction,
  handleDeleteChat
} = require("../controllers/chatController");
const {chatRateLimiter} = require("../utils/rateLimiter");
const { verifyToken } = require("../../middlewares/authMiddleware"); // adjust path to your auth middleware

router.use(verifyToken);

router.use(chatRateLimiter);

// Conversations
router.get("/conversations", handleGetConversations);
// Messages
router.get("/messages/:conversationId", handleGetMessages);
router.post("/messages", handlePostMessage); // creates message (and conv if needed)
// Seen
router.post("/seen", handleSeenConversation);
// Reactions (still compatible with your controller)
router.post("/reaction", handleReaction);
router.delete("/conversation/:otherUserId", handleDeleteChat);

module.exports = router;