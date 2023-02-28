const jwt = require("jsonwebtoken");

/**
 * Create a JWT token
 *
 * @param {String} userID User ID
 * @param {String} sessionID Session ID
 * @returns JWT token
 */
exports.createToken = (userID, session) => {
	return jwt.sign(
		{
			sub: userID,
			session,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: "1d",
			//expiresIn 10 seconds for testing
			// expiresIn: 60,
		}
	);
};

/**
 * parse jwt
 *
 * @param {String} token JWT token
 * @returns parsed data
 */
exports.parseToken = (token, sessionID) => {
	return jwt.decode(token);
};
