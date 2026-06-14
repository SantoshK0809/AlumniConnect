const express = require("express");
const router = express.Router();

const {
  handleSendRequest,
  handleAcceptRequest,
  handleRemoveFriend,
  handleRejectedRequest,
  handleGetIncomingRequests,
  handleGetConnections,
  handleGetSuggestions
} = require("./connectionController");

const { verifyToken } = require("../../middlewares/authMiddleware");

router.use(verifyToken);

router.get("/requests", handleGetIncomingRequests);
router.get("/list", handleGetConnections);
router.get("/suggestions", handleGetSuggestions);
router.post("/request/:recipientId", handleSendRequest);
router.patch("/accept/:requesterId", handleAcceptRequest);
router.patch("/reject/:requesterId", handleRejectedRequest);
router.delete("/remove/:friendId", handleRemoveFriend);

module.exports = router;
