const AdminValidationSchema = require("../validation/adminValidation");
const { errorResponse } = require("../utils/responseFormat");

const validateAdmin = (req, res, next) => {
  const { error } = AdminValidationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return errorResponse(res, error.details.map(err => err.message), "Validation error.", 400);
  }

  next();
};

module.exports = validateAdmin;
