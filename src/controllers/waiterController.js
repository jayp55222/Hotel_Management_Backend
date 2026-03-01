const waiterSchema = require("../models/waiter");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const { successResponse, errorResponse } = require("../utils/responseFormat");
const JWT_SECRET = config.JWT_SECRET;

const createWaiter = async (req, res) => {
  try {
    const {  name, email, password, superAdminId, phoneNumber } = req.body;
    if ( !name || !email || !password || !superAdminId || !phoneNumber) {
      return errorResponse(res, null, "All fields are required.", 400);
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const newWaiter = await waiterSchema.create({  name, email, password:hashedPassword, superAdminId, phoneNumber });
    return successResponse(res, newWaiter, "Waiter data added successfully!", 201);
  } catch (error) {
    console.error("Error adding waiter:", error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, error, "Waiter with this email already exists.", 409);
    }
    return errorResponse(res, error.message, "Error adding waiter details.", 500);
  }
};

const getAllWaiters = async (req, res) => {
  try {
    const waiters = await waiterSchema.findAll();
    if (!waiters.length) {
      return errorResponse(res, null, "No waiters found.", 404);
    }
    return successResponse(res, waiters, "Waiters retrieved successfully!", 200);
  } catch (error) {
    console.error("Error retrieving waiters:", error.message);
    return errorResponse(res, error.message, "Error retrieving waiters.", 500);
  }
};

const getWaiterById = async (req, res) => {
  const { id } = req.params;
  try {
    const waiter = await waiterSchema.findByPk(id);
    if (!waiter) {
      return errorResponse(res, null, "Waiter not found.", 404);
    }
    return successResponse(res, waiter, "Waiter retrieved successfully!", 200);
  } catch (error) {
    console.error("Error retrieving waiter:", error.message);
    return errorResponse(res, error.message, "Error retrieving waiter.", 500);
  }
};

const updateWaiter = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, superAdminId, phoneNumber } = req.body;

  try {
    const waiter = await waiterSchema.findByPk(id);
    if (!waiter) {
      return errorResponse(res, null, "Waiter not found.", 404);
    }
    const hashedPassword=await bcrypt.hash(password,10)
    waiter.name = name || waiter.name;
    waiter.email = email || waiter.email;
    waiter.password = hashedPassword || waiter.password;
    waiter.superAdminId = superAdminId || waiter.superAdminId;
    waiter.phoneNumber = phoneNumber || waiter.phoneNumber;

    await waiter.save();
    return successResponse(res, waiter, "Waiter updated successfully!", 200);
  } catch (error) {
    console.error("Error updating waiter:", error.message);
    return errorResponse(res, error.message, "Error updating waiter.", 500);
  }
};

const deleteWaiter = async (req, res) => {
  const { id } = req.params;
  try {
    const waiter = await waiterSchema.findByPk(id);
    if (!waiter) {
      return errorResponse(res, null, "Waiter not found.", 404);
    }
    await waiter.destroy();
    return successResponse(res, null, "Waiter deleted successfully!", 200);
  } catch (error) {
    console.error("Error deleting waiter:", error.message);
    return errorResponse(res, error.message, "Error deleting waiter.", 500);
  }
};

const generateTokenForWaiter = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, null, "Email and password are required.", 400);
  }

  try {
    const waiter = await waiterSchema.findOne({ where: { email } });

    if (!waiter) {
      return errorResponse(res, null, "Waiter not found.", 404);
    }
    const isMatch=await bcrypt.compare(password,waiter.password)

    if (!isMatch) {
      return errorResponse(res, null, "Invalid email or password.", 401);
    }

    const token = jwt.sign({ id: waiter.id, role: waiter.role }, JWT_SECRET, { expiresIn: "60h" });
    return successResponse(res, { token }, "Login successful.", 200);
  } catch (error) {
    console.error("Error during login:", error.message);
    return errorResponse(res, error.message, "Internal server error.", 500);
  }
};

module.exports = { createWaiter, getAllWaiters, getWaiterById, updateWaiter, deleteWaiter, generateTokenForWaiter };
