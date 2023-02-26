const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const userRouter = require("./users");

router.use("/", userRouter);
router.use("/", authRouter);

module.exports = router;
