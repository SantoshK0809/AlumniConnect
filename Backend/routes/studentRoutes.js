const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const {
  handleStudentProfileDelete,
  handleUpdateStudentProfile,
  handleGetMyProfile,
  handleGetUserById,
  handleInsertDataToStudentModel,
  handleGetStudentProfile,
  handleGetDashboardData,
} = require("../controller/student");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");

router.use(verifyToken, authorizeRoles("Student"));


router.get("/dashboard", handleGetDashboardData);

// GET: Student profile
router.get("/profile", handleGetStudentProfile);

router.post(
  "/profile",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  handleInsertDataToStudentModel
);
router.put("/profile/update", handleUpdateStudentProfile);

// DELETE: Delete student profile
router.delete("/profile/delete", handleStudentProfileDelete);

// GET: All events (open to students)
// router.get("/events", handleGetAllEvents);

//GET: Specific user by id
router.get("/user/:id", handleGetUserById);

// // POST: Register for an event
// router.post("/events/:eventId/register", handleRegisterForEvent);

// // GET: Mentorship list
// router.get("/mentors", handleGetAllMentors);

// router.get("/", getAllStudents);
// router.get("/:id", getStudentById);
// router.post("/", createStudent);
// router.put("/:id", updateStudent);
// router.delete("/:id", deleteStudent);

module.exports = router;
