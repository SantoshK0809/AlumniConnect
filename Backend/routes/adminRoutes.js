 const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// All routes below are protected and accessible to admins only
router.use(verifyToken, authorizeRoles("Admin"));

const { handleGetAdminDashboardData, handleGetAllUsers, handleDeleteUser, handleCsvUpload } = require("../controller/admin");

router.post("/upload-csv", upload.single("file"), handleCsvUpload);
router.get("/dashboard", handleGetAdminDashboardData);

/* --------------------- Event Management --------------------- */

// Get all events created by this admin or visible in college
// router.get("/events", getAllEvents);

// // Create a new alumni/college event
// router.post("/events", createEvent);

// // Update event details (e.g., time, venue, description)
// router.put("/events/:eventId", updateEvent);

// // Delete an event
// router.delete("/events/:eventId", deleteEvent);

/* --------------------- User Management --------------------- */

// Get list of all users
router.get("/users", handleGetAllUsers);

// Delete a user
router.delete("/users/:id", handleDeleteUser);

// /* --------------------- Mentorship Management --------------------- */

// // Assign a mentor to a mentee manually
// router.post("/mentorship/assign", assignMentor);

// // View mentorship requests (pending/approved)
// router.get("/mentorship/requests", viewMentorshipRequests);

// // Approve mentorship request
// router.post("/mentorship/approve/:requestId", approveMentorshipRequest);

// // Reject mentorship request
// router.post("/mentorship/reject/:requestId", rejectMentorshipRequest);

module.exports = router;
