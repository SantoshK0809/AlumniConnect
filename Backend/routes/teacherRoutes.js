const express = require("express");
const router = express.Router();
const {
  handleUpdateTeacherProfile,
  handleTeacherProfileDelete,
  handleInsertDataToTacherModel,
  handleGetTeacherProfile,
  handleGetDashboardData,
} = require("../controller/teacher");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/multer");

router.use(verifyToken, authorizeRoles("Teacher", "Admin"));

//router.get("/profile", handleGetTeacherProfile);
//router.get("/profile/update", handleGetTeacherProfileToUpdate)
router.get("/profile", handleGetTeacherProfile);
router.post(
  "/profile",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  handleInsertDataToTacherModel
);
// router.put(
//   "/profile",
//   upload.fields([
//     { name: "profileImage", maxCount: 1 },
//     { name: "coverImage", maxCount: 1 },
//   ]),
//   handleInsertDataToTacherModel
// );

router.put("/profile/update", handleUpdateTeacherProfile);
router.delete("/profile/delete", handleTeacherProfileDelete);
//router.get("/users/:id", handleGetTeacherProfile);

// Admin-only routes
// router.get("/all", handleGetAllTeachers);
// router.delete("/:id", handleDeleteTeacher);

router.get("/dashboard", handleGetDashboardData);

module.exports = router;
