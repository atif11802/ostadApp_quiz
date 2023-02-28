const User = require("../../models/User");

exports.getProfile = async (req, res, next) => {
	const userID = req.user.id;

	const error = {};

	try {
		const user = await User.findById(userID).select("-password");
		if (user) {
			return res.status(200).json(user);
		}
		error.message = "User not found";

		return res.status(400).json({ error });
	} catch (err) {
		next(err);
	}
};
