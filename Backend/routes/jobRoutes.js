const express = require("express");
const router = express.Router();
const {
  handleCreateJob,
  handleGetAllJobs,
  handleGetJobById,
  handleUpdateJob,
  handleDeleteJob,
} = require("../controller/jobController");
const { verifyToken } = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(verifyToken);

router.post("/", handleCreateJob);
router.get("/", handleGetAllJobs);
router.get("/:id", handleGetJobById);
router.put("/:id", handleUpdateJob);
router.delete("/:id", handleDeleteJob);

module.exports = router;
