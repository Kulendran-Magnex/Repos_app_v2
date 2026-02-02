const express = require("express");
const router = express.Router();
const invoiceController = require("../../controllers/Sales/invoiceController");

router.get("/invoice", invoiceController.getInvoices);
router.post("/invoice", invoiceController.createInvoice);

module.exports = router;
