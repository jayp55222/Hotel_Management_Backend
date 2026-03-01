const superAdminValidationSchema = require("../validation/superAdminValidation");
const { errorResponse } = require("../utils/responseFormat");

const validateSuperAdmin = (req, res, next) => {
  const { error } = superAdminValidationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return errorResponse(res, error.details.map(err => err.message), "Validation error.", 400);
  }

  next();
};

module.exports = validateSuperAdmin;
