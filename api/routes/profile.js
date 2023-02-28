const express = require("express");
const { auth } = require("../../middleware/auth");
const { getProfile } = require("../controller/profileController");
const router = express.Router();

router.get("/getProfile", auth, getProfile);

module.exports = router;
