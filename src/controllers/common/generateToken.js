const config = require("../../config/config");
const { successResponse, errorResponse } = require("../../utils/responseFormat");
const jwt = require("jsonwebtoken");

const generateToken = async (req, res) => {

  const { id, email, role } = req.user;

  try {

    const token = await jwt.sign(
      { id: id, email: email, role: role },
      config.JWT_SECRET,
      { expiresIn: "60h" },
    );

    // ✅ Set HTTP-only cookie
    res.cookie("accessToken", token, {
      httpOnly: true,              // JS cannot access (security)
      // secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      secure: true, // HTTPS only in prod
      sameSite: "strict",          // CSRF protection
      maxAge: 60 * 60 * 1000 * 60, // 60 hours
    });

    return successResponse(res, { email, role }, "Login successful.", 200);
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse(res, error, "Internal server error.", 500);
  }
};

module.exports = {
  generateToken
}