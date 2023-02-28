const express = require("express");
const User = require("../../models/User");
const argon = require("argon2");
const { createToken, parseToken } = require("../../utils/jwt");
const { v4: uuid } = require("uuid");
const generateOTP = require("../../utils/Otp_generator");
const Otp = require("../../models/Otp");
const e = require("express");
const { sendSms, sendEmail } = require("../../utils/utility");

exports.login = async (req, res, next) => {
	const { phone = "", password = "" } = req.body;
	const error = {};

	try {
		const existUser = await User.findOne({
			phone,
		}).select("+hash");

		if (existUser) {
			if (existUser.phone_verified === true) {
				const passwordMatch = await argon.verify(existUser.hash, password);

				if (passwordMatch) {
					const sessionID = uuid();
					const token = createToken(existUser._id, sessionID);
					await User.findByIdAndUpdate(existUser._id, {
						$push: {
							login_sessions: sessionID,
						},
					});

					existUser.hash = undefined;
					return res.status(200).json({
						token,
						user: existUser,
					});
				} else {
					error.password = "Password is incorrect.";
				}
			} else {
				error.phone = "Phone number is not verified.";
			}
		} else {
			error.phone = "User not found.";
		}

		return res.status(400).json({ error });
	} catch (error) {
		next(error);
	}
};

exports.register = async (req, res, next) => {
	try {
		const error = {};
		const { name = "", email = "", password = "", phone = "" } = req.body;

		const userExist = await User.find({
			$or: [
				{ email: String(email).trim(), email_verified: true },
				{ phone, phone_verified: true },
			],
		}).lean();

		if (userExist.length > 0) {
			let phoneExist = false;
			let emailExist = false;

			//check if phonenumber Or email which is verified
			userExist.forEach((user) => {
				if (user.phone_verified === true) {
					phoneExist = true;
					error.phone = "Phone number taken already.";
				}

				if (user.email_verified === true) {
					emailExist = true;
					error.email = "Email address taken already.";
				}
			});

			if (!phoneExist && !emailExist) {
				const user = new User({
					name,
					email: String(email).trim(),
					hash: await argon.hash(password),
					phone,
				});
				await user.save();
				delete user.hash;
				let otp = generateOTP(6);
				//create session
				const sessionID = uuid();
				await User.findByIdAndUpdate(user, {
					$push: {
						login_sessions: sessionID,
					},
				});
				const otp_create = new Otp({
					otp,
					session: sessionID,
				});
				await otp_create.save();

				sendSms(phone, otp);
				return res.json({
					session: sessionID,
					otp,
				});
			}

			return res.status(400).json({ error });
		} else {
			const user = new User({
				name,
				email: String(email).trim(),
				hash: await argon.hash(password),
				phone,
			});

			await user.save();

			delete user.hash;
			let otp = generateOTP(6);

			const sessionID = uuid();

			await User.findByIdAndUpdate(user, {
				$push: {
					login_sessions: sessionID,
				},
			});

			const otp_create = new Otp({
				session: sessionID,
				otp,
			});

			await otp_create.save();

			sendSms(phone, otp);
			return res.json({
				otp,
				session: sessionID,
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.verifyOtp = async (req, res, next) => {
	const { otp, session } = req.body;
	const error = {};

	const otpOk = otp !== "";
	const sessionOk = session !== "";

	try {
		if (otpOk && sessionOk) {
			// check if otp exist
			const otpExist = await Otp.findOne({ session }).lean();

			//if otp does not exist then return error
			if (!otpExist) {
				error.otp = "your otp session has expired";
			} else {
				if (otpExist.otp === otp) {
					const user = await User.findOne({ login_sessions: session }).lean();

					//check if user exist
					if (!user) {
						error.user = "user not found";
					}

					//update user phone number verified to true

					user.phone_verified = true;

					await User.findByIdAndUpdate(user._id, user);

					//delete otp
					await Otp.findByIdAndDelete(otpExist._id);

					//delete session

					await User.findByIdAndUpdate(user._id, {
						$pull: {
							login_sessions: session,
						},
					});

					return res.json({
						success: true,
						message: "Phone number verified successfully",
					});
				}
			}

			//check if otp is correct
		} else {
			if (!otpOk) {
				error.otp = "otp is required";
			}
			if (!sessionOk) {
				error.session = "session is required";
			}
		}

		return res.status(400).json({ error });
	} catch (error) {
		next(error);
	}
};

exports.sendEmail = async (req, res, next) => {
	const { email } = req.body;
	const error = {};
	try {
		const user = await User.findOne({
			email: String(email).trim(),
			email_verified: false,
		}).lean();

		if (user) {
			const sessionUuid = uuid();
			//send email
			const token = createToken(user._id, sessionUuid);

			const mailOptions = {
				subject: "Email Verification",
				html: `<p>Click on the link below to verify your email address</p>
					<a href="http://localhost:5000/api/auth/verify-email?token=${token}">Verify Email</a>
					`,
			};

			sendEmail(
				email,
				"Email Verification",
				"click on the link below to verify your email address" +
					" " +
					"http://localhost:5000/api/auth/verify-email?token=${token}"
			);
			return res.json({
				success: true,
				message: "Email sent successfully",
				mailOptions,
			});
		}
		error.email = "Email not found/Email already verified";

		return res.status(400).json({ error });
	} catch (error) {
		next(error);
	}
};

exports.verifyEmail = async (req, res, next) => {
	const { token } = req.query;
	const error = {};
	try {
		const tokenOk = token !== "";

		if (tokenOk) {
			const payload = parseToken(token);

			//check if the token is expired or not

			if (payload.exp < Date.now() / 1000) {
				error.message = "Token has expired";
			} else {
				const user = await User.findById(payload.sub);

				if (user) {
					user.email_verified = true;

					await User.findByIdAndUpdate(user._id, user);

					return res.json({
						success: true,
						message: "Email verified successfully",
					});
				} else {
					error.user = "User not found";
				}
			}
		} else {
			error.token = "Token is required";
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

exports.forgetPassword = async (req, res, next) => {
	const { phone = "" } = req.body;

	const error = {};
	try {
		const phoneOk = phone !== "";

		if (phoneOk) {
			const existUser = await User.findOne({
				phone: String(phone).trim(),
			});
			if (existUser) {
				if (existUser.phone_verified === true) {
					let otp = generateOTP(6);

					const sessionID = uuid();

					await User.findByIdAndUpdate(existUser._id, {
						$push: {
							login_sessions: sessionID,
						},
					});

					const otp_create = new Otp({
						session: sessionID,
						otp,
					});

					await otp_create.save();

					return res.json({
						session: sessionID,
						otp,
					});
				} else {
					error.phone = "Email not verified";
				}
			}

			error.phone = "User not found";
		}

		error.phone = "Phone is required";

		return res.status(400).json({ error });
	} catch (error) {
		next(error);
	}
};

exports.resetPassword = async (req, res, next) => {
	const { session = "", otp = "", newPassword = "" } = req.body;
	const error = {};
	try {
		const sessionOk = session !== "";
		const otpOk = otp !== "";
		//regex the password will be 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
		const newPasswordOk =
			newPassword !== "" &&
			newPassword.match(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
			);

		if (sessionOk && otpOk && newPasswordOk) {
			const existOtp = await Otp.findOne({
				session,
			});

			if (existOtp) {
				if (existOtp.otp === otp) {
					const existUser = await User.findOne({
						login_sessions: session,
					});

					if (existUser) {
						await User.findByIdAndUpdate(existUser._id, {
							hash: await argon.hash(newPassword),
							$pull: {
								login_sessions: session,
							},
						});

						await Otp.findByIdAndDelete(existOtp._id);

						return res.json({
							success: true,
							message: "Password reset successful.",
						});
					} else {
						error.message = "User not found";
					}
				} else {
					error.otp = "OTP is wrong";
				}
			} else {
				error.session = "otp not found";
			}
		} else if (!sessionOk) {
			error.session = "Session is required";
		} else if (!otpOk) {
			error.otp = "OTP is required";
		} else if (String(password) === "") {
			error.password = "Password is required";
		} else if (!newPasswordOk) {
			error.password =
				"Password must be 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character";
		}

		return res.status(400).json({ error });
	} catch (error) {
		next(error);
	}
};
