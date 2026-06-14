const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../../middlewares/roleMiddleware");
const {
  handleSendMentorshipRequest,
  handleReceivedMentorshipRequests,
  getSentMentorshipRequests,
  handleAcceptMentorshipRequest,
  handleRejectMentorshipRequest,
} = require("../controllers/mentorshipRequest.controller");

router.post(
  "/",
  [verifyToken, authorizeRoles("Student", "Alumni")],
  handleSendMentorshipRequest,
);

router.get(
  "/received",
  [verifyToken, authorizeRoles("Alumni")],
  handleReceivedMentorshipRequests,
);

router.get(
  "/sent",
  [verifyToken, authorizeRoles("Student", "Alumni")],
  getSentMentorshipRequests,
);

router.patch(
  "/:requestId/accept",
  [verifyToken, authorizeRoles("Alumni")],
  handleAcceptMentorshipRequest,
);

router.patch(
  "/:requestId/reject",
  [verifyToken, authorizeRoles("Alumni")],
  handleRejectMentorshipRequest,
);

module.exports = router;
