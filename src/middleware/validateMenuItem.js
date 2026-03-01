const Joi = require('joi');
const menuItemValidationSchema = require('../validation/menuItemValidation');

const validateMenuItemRequest = (req, res, next) => {
  const { error } = menuItemValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = { validateMenuItemRequest };
