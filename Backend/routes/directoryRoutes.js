const express = require("express");
const router = express.Router();
const { handleGetDirectory } = require("../controller/directory");
const { verifyToken } = require("../middlewares/authMiddleware");

router.use(verifyToken);

// GET: Directory with optional role and search query
router.get("/", handleGetDirectory);

module.exports = router;
