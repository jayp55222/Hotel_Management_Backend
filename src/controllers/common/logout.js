const { successResponse } = require("../../utils/responseFormat");

const LogoutController = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            secure: false,
            sameSite: "strict",
        });

        return successResponse(res, null, "Logged out successfully", 200);
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { LogoutController };