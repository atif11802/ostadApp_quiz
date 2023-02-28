const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			trim: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
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
		phone_verified: {
			type: Boolean,
			default: false,
		},
		email_verified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("user", UserSchema);

module.exports = User;
