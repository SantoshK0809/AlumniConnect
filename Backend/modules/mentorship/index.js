const express = require("express");
const router = express.Router();
const mentorshipRequestRoute = require("./routes/mentorshipRequestRoute");

router.use("/", mentorshipRequestRoute);

module.exports = router;
