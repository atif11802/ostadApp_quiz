const express = require("express");
const User = require("../../models/User");
const argon = require("argon2");
const { createToken, parseToken } = require("../../utils/jwt");
const { v4: uuid } = require("uuid");
/**
 * Login a user
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.login = async (req, res, next) => {
  try {
    const error = {};
    const { email = "", password = "" } = req.body;

    const emailOk =
      String(email).trim() !== "" &&
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        String(email).trim()
      );
    const passwordOk = password !== "";

    if (emailOk && passwordOk) {
      const userExist = await User.findOne({
        email: String(email).trim(),
      })
        .select("+hash")
        .lean();

      if (Boolean(userExist)) {
        if (await argon.verify(userExist.hash, password)) {
          const sessionID = uuid();

          await User.findByIdAndUpdate(userExist, {
            $push: {
              login_sessions: sessionID,
            },
          });

          userExist.token = createToken(userExist._id, sessionID);
          delete userExist.hash;

          return res.json({
            success: true,
            user: userExist,
          });
        } else {
          error.password = "Password is wrong.";
        }
      } else {
        error.email = "Account not found.";
      }
    } else {
      if (String(email).trim() === "") {
        error.email = "Email address is required.";
      } else if (
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
          String(email).trim()
        )
      ) {
        error.email = "Email address is invalid.";
      } else {
        error.password = "Password is required.";
      }
    }

    return res.status(400).json({ error });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a user
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.register = async (req, res, next) => {
  try {
    const error = {};
    const { name = "", email = "", password = "" } = req.body;

    const emailOk =
      String(email).trim() !== "" &&
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        String(email).trim()
      );
    const passwordOk = password !== "";
    const nameOk = name !== "";

    if (nameOk && emailOk && passwordOk) {
      const userExist = await User.findOne({
        email: String(email).trim(),
      });

      if (!Boolean(userExist)) {
        await User.create({
          name,
          email: String(email).trim(),
          hash: await argon.hash(password),
        });

        return res.json({
          success: true,
          message: "Registration successful!",
        });
      }

      error.email = "Account already exist with this email.";
    } else {
      if (!nameOk) {
        error.name = "Name is required.";
      } else if (String(email).trim() === "") {
        error.email = "Email address is required.";
      } else if (
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
          String(email).trim()
        )
      ) {
        error.email = "Email address is invalid.";
      } else {
        error.password = "Password is required.";
      }
    }

    return res.status(400).json({ error });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout a user
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.logout = async (req, res, next) => {
  try {
    const token = req.headers?.authorization.split("Bearer ")[1];

    const payload = parseToken(token);

    await User.findByIdAndUpdate(payload.sub, {
      $pull: {
        login_sessions: payload.sessionID,
      },
    });

    return res.json({
      success: true,
      message: "Logout successful!",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.changePassword = async (req, res, next) => {
  try {
    const error = {};
    const {
      oldPassword = "",
      newPassword = "",
      logoutFromAllDevice = false,
    } = req.body;

    const oldPasswordOk = oldPassword !== "";
    const newPasswordOk = newPassword !== "";
    const notSamePassword = oldPassword !== newPassword;

    if (oldPassword && newPasswordOk && notSamePassword) {
      const { hash } = await User.findById(req.user._id).select("hash");

      if (await argon.verify(hash, oldPassword)) {
        if (logoutFromAllDevice) {
          await User.findByIdAndUpdate(req.user._id, {
            hash: await argon.hash(newPassword),
            $set: {
              login_sessions: [],
            },
          });
        }
        await User.findByIdAndUpdate(req.user._id, {
          hash: await argon.hash(newPassword),
        });

        return res.json({
          success: true,
          message: "Password change successful.",
        });
      } else {
        error.oldPassword = "Password is wrong.";
      }
    } else {
      if (!oldPasswordOk) {
        error.oldPassword = "Old password is required.";
      } else if (!newPasswordOk) {
        error.newPassword = "New password is required.";
      } else {
        error.newPassword = "New password and old password are same.";
      }
    }

    return res.status(400).json({ error });
  } catch (error) {
    next(error);
  }
};
