const express = require("express");
const router = express.Router({});
const acceptFile = require("connect-multiparty")();

const { auth } = require("../../middleware/auth");
const { getProfile, updateProfile, updateAvatar } = require("../controller/userController");

router.get("/users/get-profile", auth, getProfile);
router.patch("/users/update-profile", auth, updateProfile);
router.patch("/users/update-avatar", auth, acceptFile, updateAvatar);

module.exports = router;
