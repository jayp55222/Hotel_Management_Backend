const Joi = require("joi");

// ─── Reusable field rules ───────────────────────────────────────────────
const fields = {
  name: Joi.string().min(2).max(100).trim().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
    }),

  password: Joi.string()
    .min(10)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .messages({
      "string.min": "Password must be at least 10 characters",
      "string.max": "Password must not exceed 64 characters",
      "string.pattern.base":
        "Password must include uppercase, lowercase, number and special character",
    }),

  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "Phone number must be a valid international number",
    }),

  gender: Joi.string().valid("male", "female", "other").messages({
    "any.only": "Gender must be one of: male, female, other",
  }),

  dateOfBirth: Joi.date().max("now").iso().allow(null, "").messages({
    "date.max": "Date of birth cannot be in the future",
    "date.format": "Date of birth must be a valid ISO date (YYYY-MM-DD)",
  }),

  nationality: Joi.string().min(2).max(100).trim().allow(null, "").messages({
    "string.min": "Nationality must be at least 2 characters",
    "string.max": "Nationality must not exceed 100 characters",
  }),

  status: Joi.string().valid("active", "inactive", "suspended").messages({
    "any.only": "Status must be one of: active, inactive, suspended",
  }),

  address: Joi.object({
    street: Joi.string().max(200).trim().allow(null, ""),
    city: Joi.string().max(100).trim().allow(null, ""),
    state: Joi.string().max(100).trim().allow(null, ""),
    country: Joi.string().max(100).trim().allow(null, ""),
    postalCode: Joi.string()
      .pattern(/^[A-Z0-9\s\-]{3,12}$/i)
      .allow(null, "")
      .messages({
        "string.pattern.base": "Postal code must be a valid format",
      }),
  }).allow(null),

  // ── SuperAdmin-specific ──────────────────────────────────────────────

  employeeId: Joi.string().min(4).max(30).trim().messages({
    "string.min": "Employee ID must be at least 4 characters",
    "string.max": "Employee ID must not exceed 30 characters",
  }),

  department: Joi.string()
    .valid(
      "operations",
      "finance",
      "it",
      "hr",
      "management",
      "security",
      "other",
    )
    .messages({
      "any.only":
        "Department must be one of: operations, finance, it, hr, management, security, other",
    }),

  accessLevel: Joi.number().integer().min(1).max(5).messages({
    "number.min": "Access level must be between 1 and 5",
    "number.max": "Access level must be between 1 and 5",
  }),

  permissions: Joi.object({
    manageAdmins: Joi.boolean().default(true),
    manageCustomers: Joi.boolean().default(true),
    manageRooms: Joi.boolean().default(true),
    manageBookings: Joi.boolean().default(true),
    manageHotels: Joi.boolean().default(true),
    manageStaff: Joi.boolean().default(true),
    viewReports: Joi.boolean().default(true),
    manageFinance: Joi.boolean().default(false),
    manageSettings: Joi.boolean().default(false),
    viewAuditLogs: Joi.boolean().default(true),
  }).allow(null),

  twoFactorEnabled: Joi.boolean().messages({
    "boolean.base": "Two-factor authentication must be a boolean value",
  }),

  sessionTimeout: Joi.number().integer().min(5).max(480).allow(null).messages({
    "number.min": "Session timeout must be at least 5 minutes",
    "number.max": "Session timeout must not exceed 480 minutes (8 hours)",
  }),

  ipWhitelist: Joi.array()
    .items(
      Joi.string()
        .ip({ version: ["ipv4", "ipv6"], cidr: "optional" })
        .messages({
          "string.ip": "Each IP must be a valid IPv4 or IPv6 address",
        }),
    )
    .max(20)
    .allow(null)
    .messages({
      "array.max": "IP whitelist must not exceed 20 entries",
    }),
};

// ─── CREATE ─────────────────────────────────────────────────────────────
const createSuperAdminSchema = Joi.object({
  name: fields.name.required(),
  email: fields.email.required(),
  password: fields.password.required(),
  phoneNumber: fields.phoneNumber.optional(),
  gender: fields.gender.optional(),
  dateOfBirth: fields.dateOfBirth.optional(),
  nationality: fields.nationality.optional(),
  address: fields.address.optional(),
  // employeeId: fields.employeeId.required(),
  // department: fields.department.required(),
  accessLevel: fields.accessLevel.default(5),
  permissions: fields.permissions.optional(),
  twoFactorEnabled: fields.twoFactorEnabled.default(true),
  sessionTimeout: fields.sessionTimeout.default(60),
  ipWhitelist: fields.ipWhitelist.optional(),
  status: fields.status.default("active"),
});

// ─── UPDATE (all fields optional, at least one required) ────────────────
const updateSuperAdminSchema = Joi.object({
  name: fields.name.optional(),
  email: fields.email.optional(),
  phoneNumber: fields.phoneNumber.optional(),
  gender: fields.gender.optional(),
  dateOfBirth: fields.dateOfBirth.optional(),
  nationality: fields.nationality.optional(),
  address: fields.address.optional(),
  department: fields.department.optional(),
  accessLevel: fields.accessLevel.optional(),
  permissions: fields.permissions.optional(),
  twoFactorEnabled: fields.twoFactorEnabled.optional(),
  sessionTimeout: fields.sessionTimeout.optional(),
  ipWhitelist: fields.ipWhitelist.optional(),
  status: fields.status.optional(),
})
  .min(1)
  .messages({
    "object.min": "Provide at least one field to update",
  });

// ─── LIST / GET ALL (query params) ──────────────────────────────────────
const listSuperAdminSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: fields.status.optional(),
  department: fields.department.optional(),
  accessLevel: fields.accessLevel.optional(),
  twoFactorEnabled: Joi.boolean().optional(),
  search: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string()
    .valid("name", "email", "department", "accessLevel", "createdAt")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

// ─── CHANGE PASSWORD (stricter for superadmin) ───────────────────────────
const changeSuperAdminPasswordSchema = Joi.object({
  currentPassword: fields.password.required(),
  newPassword: fields.password
    .required()
    .disallow(Joi.ref("currentPassword"))
    .messages({
      "any.invalid": "New password must differ from current password",
    }),
  confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Confirm password must match new password",
  }),
});

// ─── UPDATE PERMISSIONS (separate concern) ───────────────────────────────
const updateSuperAdminPermissionsSchema = Joi.object({
  permissions: fields.permissions.required(),
  accessLevel: fields.accessLevel.optional(),
}).messages({
  "object.unknown": "Only permissions and accessLevel can be updated here",
});

// ─── UPDATE IP WHITELIST (separate concern) ──────────────────────────────
const updateIpWhitelistSchema = Joi.object({
  ipWhitelist: fields.ipWhitelist.required().min(1).messages({
    "array.min": "Provide at least one IP address",
  }),
});

module.exports = {
  createSuperAdminSchema,
  updateSuperAdminSchema,
  listSuperAdminSchema,
  changeSuperAdminPasswordSchema,
  updateSuperAdminPermissionsSchema,
  updateIpWhitelistSchema,
};
