const express = require('express');
const router = express.Router();
const waiterController = require('../controllers/waiterController');
const { validateWaiterRequest } = require("../middleware/validateWaiter");

router.post('/', validateWaiterRequest, waiterController.createWaiter);
router.get('/', waiterController.getAllWaiters);
router.get('/:id', waiterController.getWaiterById);
router.put('/:id', validateWaiterRequest, waiterController.updateWaiter);
router.delete('/:id', waiterController.deleteWaiter);


module.exports = router;
