const express = require('express');
const menuController = require('../controllers/menuController');
const { validateMenuItemRequest } = require('../middleware/validateMenuItem');
const {upload}= require('../config/multerConfig');
const router = express.Router();

router.post('/', upload,validateMenuItemRequest, menuController.createMenuItem);
      
router.get('/', menuController.getAllMenuItems);          
router.get('/:id', menuController.getMenuItemById);      
router.put('/:id', menuController.updateMenuItem);       
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
