const Joi = require("joi");

const waiterValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("waiter").required(),
  superAdminId: Joi.string().required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
});

module.exports = waiterValidationSchema;
