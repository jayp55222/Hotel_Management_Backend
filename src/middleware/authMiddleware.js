const jwt = require("jsonwebtoken");
const config = require("../config/config");
const SuperAdmin = require('../models/admin');
const Waiter = require('../models/waiter');

const JWT_SECRET = config.JWT_SECRET;

async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  
  if (!token) {
    return res.status(403).json({ message: "Authentication token is required." });
  }

  const tokenValue = token.split(" ")[1];

  jwt.verify(tokenValue, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    try {
      const userId = decoded.id;
      let user;
      if (decoded.role === "superadmin") {
        user = await SuperAdmin.findByPk(userId);
      } else if (decoded.role === "waiter") {
        user = await Waiter.findByPk(userId);
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
