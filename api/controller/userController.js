const express = require("express");
const { isValidObjectId } = require("mongoose");

const { isImage, upload } = require("../../utils/file");
const User = require("../../models/User");

/**
 * Get user data Profile
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.getProfile = async (req, res, next) => {
  try {
    const error = {};
    const { userID = req.user._id } = req.query;

    if (isValidObjectId(userID)) {
      const userExist = await User.findById(userID);

      if (userExist) {
        return res.json({
          user: userExist,
        });
      } else {
        error.message = "User not exist.";
      }
    } else {
      error.message = "User ID is invalid.";
    }

    return res.status(400).json({ error });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const error = {};
    const { name, email } = req.body;
    const user = req.user;

    if (name) {
      user.name = name;
    }

    if (email) {
      if (
        await User.findOne({
          $and: [
            {
              _id: {
                $ne: user._id,
              },
            },
            {
              email: String(email).trim(),
            },
          ],
        })
      ) {
        error.email = "This email address is linked with another account.";
      } else {
        user.email = email;
      }
    }

    await user.save();

    if (error.email) {
      return res.status(400).json({ error });
    } else {
      return res.json({
        success: true,
        message: "Profile successfully updated.",
        user,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update avatar
 *
 * @param {express.Request} req Express request object
 * @param {express.Response} res Express response object
 * @param {() => } next Express callback
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    const error = {};

    const avatar = req.files?.avatar;

    const user = req.user;

    if (avatar) {
      if (avatar.size) {
        if (isImage(avatar)) {
          const { secure_url } = await upload(avatar.path);

          user.avatar = secure_url;

          await user.save();

          return res.json({
            success: true,
            message: "Avatar successfully updated.",
            user,
          });
        } else {
          error.message = "Uploaded file was not an image.";
        }
      } else {
        error.message = "File is empty.";
      }
    } else {
      error.message = "Avatar is required.";
    }

    return res.status(400).json({ error });
  } catch (error) {
    next(error);
  }
};
