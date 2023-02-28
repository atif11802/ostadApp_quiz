const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const profileRouter = require("./profile");

router.use("/", authRouter);
router.use("/", profileRouter);

module.exports = router;
