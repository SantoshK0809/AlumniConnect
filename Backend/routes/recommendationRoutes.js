const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const {
  getRecommendations,
  getMLAlumniRecommendations,
  getRecommendationAnalytics,
  getSimilarAlumni,
  getModelStats,
  retrainModel,
  getMLHealth,
} = require("../controller/recommendationController");

// Main recommendations (ML + fallback) — used by dashboard
router.get("/", verifyToken, getRecommendations);

// ML service health check
router.get("/health", verifyToken, getMLHealth);

// ML-powered alumni recommendations
router.get("/alumni", verifyToken, authorizeRoles("Student"), getMLAlumniRecommendations);

// Recommendation analytics
router.get("/analytics", verifyToken, authorizeRoles("Student"), getRecommendationAnalytics);

// Similar alumni for networking
router.get("/similar-alumni/:alumniId", verifyToken, getSimilarAlumni);

// Model management (Admin only)
router.get("/model/stats", verifyToken, authorizeRoles("Admin"), getModelStats);
router.post("/model/retrain", verifyToken, authorizeRoles("Admin"), retrainModel);

module.exports = router;
