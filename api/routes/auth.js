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
const {
	registrationValidator,
	sendEmailValidator,
	loginValidator,
} = require("../../utils/Validator");

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInput:
 *      type: object
 *      required:
 *        - email
 *        - name
 *        - password
 *        - phone
 *      properties:
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        name:
 *          type: string
 *          default: Jane Doe
 *        password:
 *          type: string
 *          default: stringPassword123
 *        phone:
 *          type: string
 *          default: +8801234567890
 *
 */

// Login or register
router.post("/auth/login", loginValidator, login);
router.post("/auth/register", registrationValidator, register);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/send-email", sendEmailValidator, sendEmail);
router.get("/auth/verify-email", verifyEmail);

router.patch("/auth/change-password", auth, changePassword);
router.post("/auth/logout", auth, logout);

router.post("/auth/forget-password", forgetPassword);
router.post("/auth/reset-password", resetPassword);

module.exports = router;
