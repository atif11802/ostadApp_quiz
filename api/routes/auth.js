const express = require("express");
const { auth } = require("../../middleware/auth");
const router = express.Router();

const {
	login,
	register,
	logout,
	changePassword,
	verifyOtp,
	sendEmail,
	verifyEmail,
	forgetPassword,
	resetPassword,
} = require("../controller/authController");

// Login or register
router.post("/auth/login", login);
router.post("/auth/register", register);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/send-email", sendEmail);
router.get("/auth/verify-email", verifyEmail);

router.patch("/auth/change-password", auth, changePassword);
router.post("/auth/logout", auth, logout);

router.post("/auth/forget-password", forgetPassword);
router.post("/auth/reset-password", resetPassword);

module.exports = router;
