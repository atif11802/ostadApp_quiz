const { body, validationResult } = require("express-validator");

exports.registrationValidator = [
	body("email", "Email is required")
		.not()
		.isEmpty()
		.isEmail()
		.withMessage("Email is not valid"),
	body("password", "Password is required")
		.not()
		.isEmpty()
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/, "i")
		.withMessage(
			"Password must be at least 12 characters long and must contain at least one uppercase letter, one lowercase letter, and one number"
		),

	body("name", "Name is required").not().isEmpty(),
	body("phone", "Phone is required")
		.not()
		.isEmpty()
		.matches(/^\+88\d{11}$/)
		.withMessage("Phone number must be in +88xxxxxxxxxx format"),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//return only message from error

			return res.status(400).json({
				error: {
					message: errors.array()[0].msg,
				},
			});
		}
		next();
	},
];

exports.sendEmailValidator = [
	body("email", "Email is required").not().isEmpty().isEmail(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//return only message from error

			return res.status(400).json({
				error: {
					message: errors.array()[0].msg,
				},
			});
		}
		next();
	},
];

exports.loginValidator = [
	body("password", "Password is required")
		.not()
		.isEmpty()
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/, "i")
		.withMessage(
			"Password must be at least 12 characters long and must contain at least one uppercase letter, one lowercase letter, and one number"
		),
	body("phone", "Phone is required")
		.not()
		.isEmpty()
		.matches(/^\+88\d{11}$/)
		.withMessage("Phone number must be in +88xxxxxxxxxx format"),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//return only message from error

			return res.status(400).json({
				error: {
					message: errors.array()[0].msg,
				},
			});
		}
		next();
	},
];
