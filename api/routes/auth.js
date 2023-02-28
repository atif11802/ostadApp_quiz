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
} = require("../controller/authController");

// Login or register
router.post("/auth/login", login);
router.post("/auth/register", register);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/send-email", sendEmail);
router.get("/auth/verify-email", verifyEmail);

router.post("/auth/logout", auth, logout);
router.patch("/auth/change-password", auth, changePassword);

module.exports = router;
