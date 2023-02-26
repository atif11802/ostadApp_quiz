const jwt = require("jsonwebtoken");

/**
 * Create a JWT token
 *
 * @param {String} userID User ID
 * @param {String} sessionID Session ID
 * @returns JWT token
 */
exports.createToken = (userID, sessionID) => {
  return jwt.sign(
    {
      sub: userID,
      sessionID,
    },
    process.env.JWT_SECRET
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
