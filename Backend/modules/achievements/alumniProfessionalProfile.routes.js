const express = require("express");
const router = express.Router();
const {
  handleCreateProfessionalAlumniProfile,
  handleGetProfessionalAlumniProfile,
  handleUpdateProfessionalProfile,
} = require("./alumniProfessionalProfile.controller");
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");

router.use(verifyToken, authorizeRoles("Alumni"));

router.get("/profile", handleGetProfessionalAlumniProfile);
router.post("/profile", handleCreateProfessionalAlumniProfile);
router.patch("/profile", handleUpdateProfessionalProfile);

module.exports = router;
