const bcrypt = require("bcryptjs");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseFormat");
const { superAdminSchema, customerSchema, adminSchema } = require("../../models");

const RegisterController = async (req, res, next) => {
  const { name, email, phoneNumber, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const validRoles = ["superadmin", "admin", "waiter", "customer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "superadmin") {
      const existingSuperAdmin = await superAdminSchema.findOne({
        where: { email },
      });

      if (existingSuperAdmin) {
        return errorResponse(
          res,
          "SuperAdmin with this email allready exist",
          null,
          409,
        );
      }

      const newSuperAdmin = await superAdminSchema.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
      });
      return successResponse(
        res,
        newSuperAdmin,
        "SuperAdmin Created Successfully",
        201,
      );
    } else if (role === "admin") {
      const existingAdmin = await adminSchema.findOne({ where: { email } })

      if (existingAdmin) {
        return errorResponse(res, null, "User with this email allready exist", 409);
      }
      const newAdmin = await adminSchema.create({
        name,
        email,
        password: hashedPassword,
        // phoneNumber,
      })

      return successResponse(res, newAdmin, "User Create Succefully", 201);


    } else if (role === "customer") {
      const existingCustomer = await customerSchema.findOne({ where: { email } });

      if (existingCustomer) {
        return errorResponse(res, "User with this email allready exist", null, 409);
      }

      const newCustomer = await customerSchema.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
      });

      return successResponse(res, newCustomer, "User Create Succefully", 201);
    }
    next();
  } catch (error) {
    console.log("This is the error", error);

    return errorResponse(res, "superAdmin or User creation failed", null, 409);
  }
};

module.exports = {
  RegisterController,
};
