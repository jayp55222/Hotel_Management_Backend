const express = require('express');
const adminRoutes = require('./adminRoutes');
const waiterRoutes = require('./waiterRoutes');
const hotelTableRoutes = require('./tableRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const menuItemRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const { verifyToken, restrictToRole } = require('../middleware/authMiddleware');
const { generateTokenForWaiter} =require('../controllers/waiterController')
const router = express.Router();
router.post("/login", generateTokenForWaiter);
router.use('/admin', adminRoutes);
router.use('/waiter', verifyToken, restrictToRole('superadmin'), waiterRoutes);
router.use('/hotelTable', verifyToken, restrictToRole('superadmin'), hotelTableRoutes);
router.use('/menu', verifyToken, restrictToRole('superadmin'), menuItemRoutes);
router.use('/order', verifyToken, restrictToRole('superadmin', 'waiter'), orderRoutes);
router.use('/invoice', verifyToken, restrictToRole('superadmin', 'waiter'), invoiceRoutes);

module.exports = router;
