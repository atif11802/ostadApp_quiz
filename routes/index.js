var express = require("express");
var router = express.Router();

var apiRoutes = require("../api/routes");

router.get("/", (req, res) => {
	return res.status(200).json({
		message: "Welcome to the API",
	});
});

router.use("/api", apiRoutes);

module.exports = router;
