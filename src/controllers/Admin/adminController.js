const AdminSchema = require("../../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../../config/config");
const { successResponse, errorResponse } = require("../../utils/responseFormat");
// const superAdminValidationSchema = require("../validation/superAdminValidation"); 
const superAdminValidationSchema = require("../../validation/adminValidation");
const { Op } = require("sequelize");
const JWT_SECRET = config.JWT_SECRET;

/**
 * @desc    Create Admin
 * @route   GET /api/v1/courses
 * @access  Public
 */
const createAdmin = async (req, res) => {
  try {
    const { error } = superAdminValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        "Validation error.",
        400,
      );
    }

    const { name, email, password } = req.body;
    const existingSuperAdmin = await AdminSchema.findOne({
      where: { email },
    });
    if (existingSuperAdmin) {
      return errorResponse(
        res,
        null,
        "SuperAdmin with this email already exists.",
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSuperAdmin = await AdminSchema.create({
      name,
      email,
      password: hashedPassword,
    });

    return successResponse(
      res,
      newSuperAdmin,
      "SuperAdmin created successfully!",
      201,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, error, "Error creating SuperAdmin.", 500);
  }
};

/**
 * @desc    Get All Admin
 * @route   GET /api/v1/courses
 * @access  Public
 */
const getAllAdmins = async (req, res) => {
  try {
    const superAdmins = await AdminSchema.findAll();
    if (!superAdmins.length) {
      return successResponse(res, [], "No SuperAdmins found.", 200);
    }

    return successResponse(
      res,
      superAdmins,
      "SuperAdmins retrieved successfully.",
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, error, "Error retrieving SuperAdmins.", 500);
  }
};

/**
 * @desc    Get Admin by Id
 * @route   GET /api/v1/courses
 * @access  Public
 */
const getAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const superAdmin = await AdminSchema.findByPk(id);
    if (!superAdmin) {
      return errorResponse(res, null, "SuperAdmin not found.", 404);
    }

    return successResponse(
      res,
      superAdmin,
      "SuperAdmin retrieved successfully.",
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, error, "Error retrieving SuperAdmin.", 500);
  }
};

/**
 * @desc    Update Admin
 * @route   GET /api/v1/courses
 * @access  Public
 */
const updateAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const superAdmin = await AdminSchema.findByPk(id);
    if (!superAdmin) {
      return errorResponse(res, null, "SuperAdmin not found.", 404);
    }

    const { error } = superAdminValidationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        "Validation error.",
        400,
      );
    }

    const { name, email, password } = req.body;
    const updatedPassword = password
      ? await bcrypt.hash(password, 10)
      : superAdmin.password;

    superAdmin.name = name || superAdmin.name;
    superAdmin.email = email || superAdmin.email;
    superAdmin.password = updatedPassword;

    await superAdmin.save();

    return successResponse(
      res,
      superAdmin,
      "SuperAdmin updated successfully!",
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, error, "Error updating SuperAdmin.", 500);
  }
};

/**
 * @desc    Delete Admin
 * @route   GET /api/v1/courses
 * @access  Public
 */
const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const superAdmin = await AdminSchema.findByPk(id);
    if (!superAdmin) {
      return errorResponse(res, null, "SuperAdmin not found.", 404);
    }

    await superAdmin.destroy();
    return successResponse(res, null, "SuperAdmin deleted successfully!", 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, error, "Error deleting SuperAdmin.", 500);
  }
};

const generateTokenForAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, null, "Email and password are required.", 400);
  }

  try {
    const superAdmin = await AdminSchema.findOne({ where: { email } });
    if (!superAdmin) {
      return errorResponse(res, null, "SuperAdmin not found.", 404);
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    console.log(isMatch);
    if (!isMatch) {
      return errorResponse(res, null, "Invalid email or password.", 401);
    }

    const token = jwt.sign(
      { id: superAdmin.id, role: superAdmin.role },
      JWT_SECRET,
      { expiresIn: "60h" },
    );

    return successResponse(res, { token }, "Login successful.", 200);
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse(res, error, "Internal server error.", 500);
  }
};

/**
 * @desc    Get Paginated Admin
 * @route   GET /api/v1/courses
 * @access  Public
 */
const getPaginatedAdmins = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit) || 10;
  const query = req.query.query;
  const offset = page * limit;

  let whereCondition = {};

  // If query exists → search name OR email
  if (query) {
    whereCondition = {
      [Op.or]: [
        {
          name: {
            [Op.like]: `%${query}%`,
          },
        },
        {
          email: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    };
  }

  try {
    const { count, rows } = await AdminSchema.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return successResponse(
      res,
      {
        superAdmins: rows,
        currentPage: page,
        totalPages,
        totalSuperAdmins: count,
      },
      "Paginated SuperAdmins retrieved successfully.",
      200,
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      error,
      "Error retrieving paginated SuperAdmins.",
      500,
    );
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  generateTokenForAdmin,
  getPaginatedAdmins,
};
