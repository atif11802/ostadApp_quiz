const express = require("express");
const User = require("../../models/User");
const argon = require("argon2");
const { createToken, parseToken } = require("../../utils/jwt");
const { v4: uuid } = require("uuid");
const generateOTP = require("../../utils/Otp_generator");
const Otp = require("../../models/Otp");

exports.login = async (req, res, next) => {
	const { phone = "", password = "" } = req.body;
	const error = {};

	try {
		const phoneOk =
			String(phone).trim() !== "" && /^\+88\d{11}$/.test(String(phone).trim());
		const passwordOk = password !== "";

		if (phoneOk && passwordOk) {
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
		}
		if (!phoneOk) {
			error.phone = "Phone number is invalid.";
		}
		if (!passwordOk) {
			error.password = "Password is required.";
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

		const emailOk =
			String(email).trim() !== "" &&
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
				String(email).trim()
			);
		//regex for password validation (at least 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
		const passwordOk =
			password !== "" &&
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/.test(password);
		const nameOk = name !== "";

		const phoneOk =
			String(phone).trim() !== "" && /^\+88\d{11}$/.test(String(phone).trim());

		if (nameOk && emailOk && passwordOk && phoneOk) {
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
						error.phone = "Phone number already exist.";
					} else if (user.email_verified === true) {
						emailExist = true;
						error.email = "Email address already exist.";
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

				return res.json({
					otp,
					session: sessionID,
				});
			}
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
			} else if (String(password).trim() === "") {
				error.password = "Password is required.";
			} else if (
				!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/.test(password)
			) {
				error.password =
					"Password must be at least 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character";
			} else if (!phoneOk) {
				error.phone = "Phone number is invalid";
			}
		}

		return res.status(400).json({ error });
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
		error.otp = "otp is incorrect";
		return res.status(400).json({ error });
	} catch (error) {
		next(error);
	}
};

exports.sendEmail = async (req, res, next) => {
	const { email } = req.body;
	const error = {};
	try {
		const emailOk =
			String(email).trim() !== "" &&
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
				String(email).trim()
			);

		if (emailOk) {
			const user = await User.findOne({ email: String(email).trim() }).lean();

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

				return res.json({
					success: true,
					message: "Email sent successfully",
					mailOptions,
				});
			} else {
				error.email = "Email not found";
			}
		} else {
			error.email = "Email is required";
		}

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
