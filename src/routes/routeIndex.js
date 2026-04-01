const express = require('express');
const adminRoutes = require('./Admin/adminIndex')
const superadminRoutes = require('./SuperAdmin/index')
const waiterRoutes = require('./waiterRoutes');
const hotelTableRoutes = require('./tableRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const menuItemRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const { verifyToken, restrictToRole } = require('../middleware/Auth/authMiddleware');
const validateLoginUser = require("../middleware/validateLoginUser");
const { RegisterController } = require("../controllers/common/create");
const validateRegisterUser = require("../middleware/validateRegisterUser");
const { LoginController } = require("../controllers/common/login");
const { LogoutController } = require("../controllers/common/logout");
const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/waiter', verifyToken, restrictToRole('superadmin'), waiterRoutes);
router.use('/hotelTable', verifyToken, restrictToRole('superadmin'), hotelTableRoutes);
router.use('/menu', verifyToken, restrictToRole('superadmin'), menuItemRoutes);
router.use('/order', verifyToken, restrictToRole('superadmin', 'waiter'), orderRoutes);
router.use('/invoice', verifyToken, restrictToRole('superadmin', 'waiter'), invoiceRoutes);
router.post("/login", validateLoginUser, LoginController);
router.post("/register", validateRegisterUser, RegisterController);
router.post("/logout", LogoutController);
router.get("/isTrustedUser", verifyToken, (req, res) => {
    res.status(200).json({ message: "Authenticated", user: req.user });
});

module.exports = router;
