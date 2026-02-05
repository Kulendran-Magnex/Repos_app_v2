const express = require("express");
const router = express.Router();
const invoiceController = require("../../controllers/Sales/invoiceController");

router.get("/invoices", invoiceController.getInvoices);
router.get("/invoices/:id", invoiceController.getInvoiceById);
router.get("/invoices/:id/pdf", invoiceController.getInvoicePDF);
router.post("/invoices", invoiceController.createInvoice);

module.exports = router;
