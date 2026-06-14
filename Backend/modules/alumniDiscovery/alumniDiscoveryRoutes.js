const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  handleSearchProfessionalAlumni,
  handleGetPublicAlumniProfile
} = require("./alumniDiscoveryController");

// router.use(verifyToken, authorizeRoles("Student", "Teacher", "Alumni"));

// router.get("/search-professional", handleSearchProfessionalAlumni);

router.get(
  "/search-professional",
  verifyToken,
  authorizeRoles("Student", "Teacher", "Alumni"),
  handleSearchProfessionalAlumni,
);

router.get(
  "/profile/:userId",
  verifyToken,
  handleGetPublicAlumniProfile
);

module.exports = router;
