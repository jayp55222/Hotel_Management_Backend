const express = require("express");
const sequelize = require("./config/db");
const config = require("./config/config");
const routes = require("./routes/routeIndex");
const cors = require("cors");
// const validateLoginUser = require("./middleware/validateLoginUser");
// const { RegisterController } = require("./controllers/common/create");
// const validateRegisterUser = require("./middleware/validateRegisterUser");
// const { LoginController } = require("./controllers/common/login");
// const { LogoutController } = require("./controllers/common/logout");
// const { verifyToken } = require("./middleware/Auth/authMiddleware");
const cookieParser = require("cookie-parser");


const app = express();
const PORT = config.port;

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully.",
    );
    await sequelize.sync({ force: false });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

app.use("/api", routes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
