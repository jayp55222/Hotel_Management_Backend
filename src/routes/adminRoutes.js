const express = require("express");
const validateSuperAdmin = require("../middleware/validateSuperAdmin");
const adminController= require("../controllers/adminController");

const router = express.Router();


router.post("/createSuperAdmin", validateSuperAdmin, adminController.createSuperAdmin);

router.post("/login", adminController.generateTokenForAdmin);

router.get("/", adminController.getAllSuperAdmins);

router.get("/superAdmin/paginatedAdmins", adminController.getPaginatedSuperAdmins);

router.get("/superAdmin/:id", adminController.getSuperAdminById);

router.put("/superAdmin/:id", validateSuperAdmin, adminController.updateSuperAdmin);

router.delete("/superAdmin/:id",  adminController.deleteSuperAdmin);

module.exports = router;
