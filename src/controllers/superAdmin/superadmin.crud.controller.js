const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { superAdminSchema } = require("../../models");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const SALT_ROUNDS = 10;

// ─────────────────────────────────────────────
// @desc    Create a new account
// @route   POST /api/super-admin/accounts
// @access  Super Admin
// ─────────────────────────────────────────────
const createSuperAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await superAdminSchema.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS,);

        // ── Persist ──────────────────────────────────
        const account = await superAdminSchema.create({
            name,
            email: email,
            password: hashedPassword
        });

        // Strip password from response
        const { password: _pw, ...accountData } = account.toObject();

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: accountData,
        });
    } catch (err) {
        console.error("[SuperAdmin] createAccount error:", err);
        return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @desc    List all accounts (with pagination & search)
// @route   GET /api/super-admin/accounts
// @access  Super Admin
// ─────────────────────────────────────────────
const getAllAccounts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = "",
            role,
            status,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (role) filter.role = role;
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const sortOrder = order === "asc" ? 1 : -1;

        const [accounts, total] = await Promise.all([
            Account.find(filter)
                .select("-password")
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(Number(limit)),
            Account.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: accounts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        console.error("[SuperAdmin] getAllAccounts error:", err);
        return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @desc    Get a single account by ID
// @route   GET /api/super-admin/accounts/:id
// @access  Super Admin
// ─────────────────────────────────────────────
const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).select("-password");

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        return res.status(200).json({ success: true, data: account });
    } catch (err) {
        console.error("[SuperAdmin] getAccountById error:", err);
        return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @desc    Update an account
// @route   PUT /api/super-admin/accounts/:id
// @access  Super Admin
// ─────────────────────────────────────────────
const updateAccount = async (req, res) => {
    try {
        const { name, email, password, role, phone, status } = req.body;

        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        // ── Email uniqueness check ───────────────────
        if (email && email.toLowerCase() !== account.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format." });
            }
            const duplicate = await Account.findOne({ email: email.toLowerCase() });
            if (duplicate) {
                return res.status(409).json({ success: false, message: "Email already in use." });
            }
            account.email = email.toLowerCase();
        }

        // ── Apply updates ────────────────────────────
        if (name) account.name = name;
        if (role) account.role = role;
        if (phone) account.phone = phone;
        if (status) account.status = status;

        // Re-hash only when a new password is supplied
        if (password) {
            account.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        account.updatedBy = req.admin.id;
        await account.save();

        const { password: _pw, ...accountData } = account.toObject();

        return res.status(200).json({
            success: true,
            message: "Account updated successfully.",
            data: accountData,
        });
    } catch (err) {
        console.error("[SuperAdmin] updateAccount error:", err);
        return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @desc    Delete an account (hard delete)
// @route   DELETE /api/super-admin/accounts/:id
// @access  Super Admin
// ─────────────────────────────────────────────
const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        // Prevent super admin from deleting their own account
        if (account._id.toString() === req.admin.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own super admin account.",
            });
        }

        await Account.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: `Account '${account.email}' deleted successfully.`,
        });
    } catch (err) {
        console.error("[SuperAdmin] deleteAccount error:", err);
        return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @desc    Soft-delete / suspend an account
// @route   PATCH /api/super-admin/accounts/:id/status
// @access  Super Admin
// ─────────────────────────────────────────────
const updateAccountStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const VALID_STATUSES = ["active", "suspended", "banned", "inactive"];

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `status must be one of: ${VALID_STATUSES.join(", ")}.`,
            });
        }

        const account = await Account.findByIdAndUpdate(
            req.params.id,
            { status, updatedBy: req.admin.id },
            { new: true }
        ).select("-password");

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Account status updated to '${status}'.`,
            data: account,
        });
    } catch (err) {
        console.error("[SuperAdmin] updateAccountStatus error:", err);
        return res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
    }
};

module.exports = {
    createSuperAdmin,
    getAllAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
};
