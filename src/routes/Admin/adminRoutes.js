const express = require("express");
const validateAdmin = require("../../middleware/validateAdmin");
const Controller = require("../../controllers/controllerIndex");

const router = express.Router();

router.get("/", Controller.getAllAdmins);

router.get("/Admin/paginatedAdmins", Controller.getPaginatedAdmins);

router.get("/Admin/:id", Controller.getAdminById);

router.put("/Admin/:id", validateAdmin, Controller.updateAdmin);

router.delete("/Admin/:id", Controller.deleteAdmin);

module.exports = router;
