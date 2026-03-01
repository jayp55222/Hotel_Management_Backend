const Joi = require('joi');
const menuItemValidationSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().optional(),
    category: Joi.string().required(),
    isAvailable: Joi.boolean().default(true),
    imageUrl: Joi.string().uri().optional(),
    preparationTime: Joi.number().min(1).optional(),
    superAdminId: Joi.string(),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now),
  });
  module.exports = menuItemValidationSchema;