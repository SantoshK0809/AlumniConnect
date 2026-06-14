const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controller/recommendationController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, getRecommendations);

module.exports = router;
