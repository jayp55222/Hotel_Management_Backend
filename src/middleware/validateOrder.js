const { placeOrderSchema } = require('../validation/orderValidationSchema');

const validatePlaceOrderRequest = (req, res, next) => {
  const { error } = placeOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validatePlaceOrderRequest };
