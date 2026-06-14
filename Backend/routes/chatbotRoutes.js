const express = require("express");
const router = express.Router();
const { handleChatQuery } = require("../controller/chatbotController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Protected route - only logged in users can use the chatbot
router.post("/query", verifyToken, handleChatQuery);

module.exports = router;
