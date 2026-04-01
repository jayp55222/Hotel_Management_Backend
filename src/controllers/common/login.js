const bcrypt = require("bcryptjs");
const { superAdminSchema, waiterSchema, customerSchema } = require("../../models");
const { errorResponse } = require("../../utils/responseFormat");
const { generateToken } = require("./generateToken");

const LoginController = async (req, res) => {
  const { email, role, password } = req.body;

  let User;

  if (role === "superadmin") {
    const admin = await superAdminSchema.findOne({ where: { email } });

    User = admin
  }
  else if (role === "waiter") {
    const waiter = await waiterSchema.findOne({ where: { email } });

    User = waiter
  }
  else if (role === "user") {
    const user = await customerSchema.findOne({ where: { email } });

    User = user
  }

  if (!User) {
    return errorResponse(res, null, "User Not Found", 401);
  }

  const isMatch = await bcrypt.compare(
    password,
    User.password
  );

  if (!isMatch) {
    return errorResponse(res, null, "Email or Password is wrong", 401);
  }

  req.user = User

  return generateToken(req, res)

};

module.exports = {
  LoginController,
};
