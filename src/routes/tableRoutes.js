const express = require('express');
const router = express.Router();
const { validateTableRequest } = require('../middleware/validateTable');
const tableController = require('../controllers/tableController');

router.post('/', validateTableRequest, tableController.createHotelTable);
router.get('/', tableController.getAllHotelTables);
router.get('/:id', tableController.getHotelTableById);
router.put('/:id', validateTableRequest, tableController.updateHotelTable);
router.delete('/:id', tableController.deleteHotelTable);

module.exports = router;
