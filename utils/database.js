/**
 *
 * @param {String} env Server envirorment eg: req.app.get("env")
 * @returns Connection URI of MongoDB
 */
exports.getDatabaseUri = () => {
	if (process.env.NODE_ENV === "production") {
		return process.env.DB_URI;
	}

	return `mongodb://localhost/indicium`;
};
