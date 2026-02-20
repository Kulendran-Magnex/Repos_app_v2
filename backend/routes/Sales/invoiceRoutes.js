const express = require("express");
const router = express.Router();
const invoiceController = require("../../controllers/Sales/invoiceController");

router.get("/invoices", invoiceController.getInvoices);
router.get("/invoices/header/:id", invoiceController.getInvoiceHeaderByID);
router.get("/invoices/tran/:id", invoiceController.getInvoiceTranByID);
router.get("/invoices/:id", invoiceController.getInvoiceById);
router.get("/invoices/:id/pdf", invoiceController.getInvoicePDF);
router.get("/invoices/unpaid/:id", invoiceController.getInvoicesByCustomerId);
router.post("/invoices", invoiceController.createInvoice);
router.put("/invoices/:INV_Code", invoiceController.updateInvoice);
router.put("/payment", invoiceController.recordPayment);

module.exports = router;
