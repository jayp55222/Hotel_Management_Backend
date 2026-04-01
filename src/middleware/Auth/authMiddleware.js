const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const Waiter = require('../../models/waiter');
const customerSchema = require("../../models/customer");
const adminSchema = require("../../models/admin");
const { superAdminSchema } = require("../../models");

const JWT_SECRET = config.JWT_SECRET;

async function verifyToken(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(403).json({ message: "Authentication token is required." });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: err });
    }

    try {
      const userId = decoded.id;
      let user;

      if (decoded.role === "superadmin") {
        user = await superAdminSchema.findByPk(userId);
      } else if (decoded.role === "admin") {
        user = await adminSchema.findByPk(userId);
      }
      else if (decoded.role === "waiter") {
        user = await Waiter.findByPk(userId);
      }
      else if (decoded.role === "customer") {
        user = await customerSchema.findByPk(userId);
      } else {
        return res.status(403).json({ message: "Invalid user role." });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      req.user = {
        id: user.id,
        role: user.role,
      };


      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
  });
}

function restrictToRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "You are not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  restrictToRole,
};
