const express = require("express");
const router = express.Router();
const {
  handleRegisterUsers,
  handleUserLogin,
  handleVerifyIdentity,
  handleGetPublicStats,
  handleSendRegistrationOtp,
  handleForgotPasswordOtp,
  handleResetPassword,
} = require("../controller/loginRegister");

//router.route("/login").get(getLoginPage).post(handleUserLogin);

router.route("/login").post(handleUserLogin);

//router
//.route("/register")
//.get(getRegisterPage)
//.post(handleRegisterUsers);

router.route("/register").post(handleRegisterUsers);
router.route("/send-registration-otp").post(handleSendRegistrationOtp);
router.route("/verify-identity").post(handleVerifyIdentity);
router.route("/public/stats").get(handleGetPublicStats);
router.route("/forgot-password").post(handleForgotPasswordOtp);
router.route("/reset-password").post(handleResetPassword);

module.exports = router;

