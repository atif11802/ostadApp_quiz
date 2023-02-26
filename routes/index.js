var express = require("express");
var router = express.Router();

var apiRoutes = require("../api/routes");

router.get("/", (req, res) => {
  return res.sendStatus(200);
});

router.use("/api", apiRoutes);

module.exports = router;
