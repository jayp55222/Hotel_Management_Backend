const express = require('express');
const router = express.Router();
const { validatePlaceOrderRequest } = require('../middleware/validateOrder');
const orderController = require('../controllers/orderController');

router.post('/placeOrder', validatePlaceOrderRequest, orderController.placeOrder);
router.get('/all', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);
router.get('/table/:tableId', orderController.getOrdersByTableId);
router.get('/waiter/:waiterId', orderController.getOrdersByWaiterId);
router.get('/status/:status', orderController.getOrdersByStatus);
router.get('/customer/:customerId', orderController.getOrdersByCustomerId);

module.exports = router;
