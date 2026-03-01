const waiterValidationSchema = require("../validation/waiterValidation");
const { errorResponse } = require("../utils/responseFormat");

const validateWaiterRequest = (req, res, next) => {
  const { error } = waiterValidationSchema.validate(req.body);

  if (error) {
    return errorResponse(res, error.details.map(err => err.message), "Validation error.", 400);
  }
  
  next();
};

module.exports = { validateWaiterRequest };
