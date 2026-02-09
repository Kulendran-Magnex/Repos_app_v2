const express = require("express");
const router = express.Router();
const invoiceController = require("../../controllers/Sales/invoiceController");

router.get("/invoices", invoiceController.getInvoices);
router.get("/invoices/header/:id", invoiceController.getInvoiceHeaderByID);
router.get("/invoices/tran/:id", invoiceController.getInvoiceTranByID);
router.get("/invoices/:id", invoiceController.getInvoiceById);
router.get("/invoices/:id/pdf", invoiceController.getInvoicePDF);
router.post("/invoices", invoiceController.createInvoice);
router.put("/invoices/:INV_Code", invoiceController.updateInvoice);

module.exports = router;
