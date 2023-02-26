const express = require("express");
const { auth } = require("../../middleware/auth");
const router = express.Router();

const { login, register, logout, changePassword } = require("../controller/authController");

// Login or register
router.post("/auth/login", login);
router.post("/auth/register", register);
router.post("/auth/logout", auth, logout);
router.patch("/auth/change-password", auth, changePassword);

module.exports = router;
