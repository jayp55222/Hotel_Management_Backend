/**
 * Sends a successful JSON response.
 *
 * @param {import('express').Response} response - Express response instance
 * @param {*} data - The data to send in the response
 * @param {string} [message="Request successful"] - Optional success message
 * @param {number} [statusCode=200] - Optional HTTP status code
 */
const successResponse = (
  res,
  data,
  message = "Request successful",
  statusCode = 200,
) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

/**
 *
 * @param {import('express').Response} response Express response instance
 * @param {*} error  Error object or message
 * @param {*} message Optional custom message
 * @param {*} statusCode Optional HTTP status code
 * @returns
 */

const errorResponse = (
  res,
  error,
  message = "Request failed",
  statusCode = 500,
) => {
  if (error == null) {
    return res.status(statusCode).json({
      status: "error",
      message,
    });
  }
  res.status(statusCode).json({
    status: "error",
    message,
    error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
