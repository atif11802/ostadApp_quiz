var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// var apiRouter = require("./api/routes");
var indexRouter = require("./routes");

require("./config/cloudinary")();
require("./config/database")();
require("./config/passport");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
// app.use("/api", apiRouter);

module.exports = app;
