require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
//swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("./swagger.json");

// const options = {
// 	definition: {
// 		openapi: "3.0.0",
// 		info: {
// 			title: "Learning Documentation",
// 			version: "1.0.1",
// 			description: "Ostad  API Documentation",
// 		},
// 		components: {
// 			securitySchemes: {
// 				bearerAuth: {
// 					type: "http",
// 					scheme: "bearer",
// 					bearerFormat: "JWT",
// 				},
// 			},
// 		},
// 		security: [
// 			{
// 				bearerAuth: [],
// 			},
// 		],
// 		servers: [
// 			{
// 				url: "http://localhost:5000",
// 				description: "Local server",
// 			},
// 		],
// 	},
// 	apis: ["./routes/*.js", "./api/routes/*.js"],
// };

var options = {
	explorer: true,
	apis: ["./routes/*.js"],
};

// const specs = swaggerJSDoc("./swagger.json");

var indexRouter = require("./routes");

require("./config/cloudinary")();
require("./config/database")();
require("./config/passport");

var app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc, options));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);

module.exports = app;
