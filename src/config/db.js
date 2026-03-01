const config = require("../config/config");
const { Sequelize } = require('sequelize');

// console.log(process.env.DB_HOST)
// console.log(config.DB_Name);


const sequelize = new Sequelize(config.DB_Name, config.DB_User, config.DB_Password, {
  host: config.DB_Host,
  dialect: 'mysql',
  logging: console.log,
});


// const sequelize = new Sequelize("CRUD", "root", "12345", {
//   host: "127.0.0.1",
//   dialect: 'mysql',
//   logging: console.log,
// });

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
})();

module.exports = sequelize; 
