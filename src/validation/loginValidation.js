import Joi from "joi";
// const Joi = require('joi')

/**
 * Allowed roles in system
 * Update this based on your hotel management roles
 */
const roles = ["superadmin", "waiter", "customer"];

/**
 * Email + Password + Role Schema
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must include uppercase, lowercase, number and special character",
      "any.required": "Password is required",
    }),

  role: Joi.string()
    .valid(...roles)
    .required()
    .messages({
      "any.only": "Invalid role selected",
      "any.required": "Role is required",
    }),
});
