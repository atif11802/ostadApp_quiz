const mongoose = require("mongoose");
var debug = require("debug")("app:database");

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.DB_URI);
    debug(`Connected with: ${db.connection.host}`);
  } catch (error) {
    debug("Connection failed!");
    process.exit(1);
  }
};

module.exports = connectDB;
