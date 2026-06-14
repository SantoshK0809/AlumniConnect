const express = require("express");
const router = express.Router();
const { handleGetPublicProfile } = require("../controller/profileController");
const { verifyToken } = require("../middlewares/authMiddleware");

// All authenticated users can view public profiles
router.get("/public/:role/:id", verifyToken, handleGetPublicProfile);

module.exports = router;
