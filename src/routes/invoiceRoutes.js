const express = require("express");
const invoiceController = require("../controllers/invoiceController");
const router = express.Router();

router.get("/pdf/:invoiceId", invoiceController.generateInvoice); 
router.get("/:invoiceId", invoiceController.getInvoice);          
router.put("/:invoiceId", invoiceController.updateInvoiceStatus); 
router.get("/", invoiceController.getAllInvoices);

module.exports = router;
