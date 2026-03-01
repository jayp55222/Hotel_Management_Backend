
const Joi = require('joi');

const superAdminValidationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('superAdmin').required(),
  phoneNumber: Joi.string().length(10).pattern(/^\d+$/)

});

module.exports = superAdminValidationSchema;

