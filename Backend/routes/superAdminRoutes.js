const express = require("express");
const router = express.Router();
const {
  handleSuperAdminLogin,
  handleSuperAdminGetLoginPage,
  handelGetAllAdmins,
  handleDeleteAdmin,
  handleUpdateAdmin,
  handleGetSystemStats,
} = require("../controller/superAdmin");
const { handleRegisterAdmin } = require("../controller/loginRegister");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

//Get login page
router.get("/login", handleSuperAdminGetLoginPage);

//Login super admin
router.post("/login", handleSuperAdminLogin);

// Only SuperAdmin can access these
router.use(verifyToken, authorizeRoles("superadmin"));

// Create new admin
router.post("/create-admin", handleRegisterAdmin);

// Get all admins
router.get("/admins", handelGetAllAdmins);

// Delete admin
router.delete("/admin/:id", handleDeleteAdmin);

// Update admin details
router.put("/admin/:id", handleUpdateAdmin);

// Get system stats or summary
router.get("/stats", handleGetSystemStats);

module.exports = router;
