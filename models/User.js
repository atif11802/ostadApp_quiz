const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default:
        "https://cdn2.iconfinder.com/data/icons/user-people-4/48/5-512.png",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
      select: false,
    },
    login_sessions: {
      type: [String],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);

module.exports = User;
