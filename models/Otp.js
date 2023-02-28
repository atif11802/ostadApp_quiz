const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
	{
		session: {
			type: String,
			required: true,
		},
		otp: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			index: {
				expires: 300,
			},
		},
	},
	{
		timestamps: true,
	}
);

const Otp = mongoose.model("otp", OtpSchema);

module.exports = Otp;
