const { creationSchema } = require("../validation/creationValidation");
const { errorResponse } = require("../utils/responseFormat");

const validateRegisterUser = (req, res, next) => {
  const { error } = creationSchema.validate(req.body, { abortEarly: false });

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

module.exports = validateRegisterUser;
