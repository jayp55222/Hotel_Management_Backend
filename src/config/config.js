const dotenv = require("dotenv");
dotenv.config()
const config = {
  DB_Name: process.env.DB_NAME,
  DB_User: process.env.DB_USER,
  DB_Password: process.env.DB_PASSWORD, 
  DB_Host: process.env.DB_HOST,
  port: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET
};

module.exports = config;
