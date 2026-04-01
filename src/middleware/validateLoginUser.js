const { loginSchema } = require("../validation/loginValidation");
const { errorResponse } = require("../utils/responseFormat");

const validateLoginUser = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return errorResponse(
      res,
      error.details.map((err) => err.message),
      "Validation error.",
      400,
    );
  }

  next();
};

module.exports = validateLoginUser;
