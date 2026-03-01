const { tableValidationSchema } = require('../validation/hotelTableValidation');

const validateTableRequest = (req, res, next) => {
  const { error } = tableValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateTableRequest };
