const express = require("express");
const router = express.Router();

const recordPaymentController = require("../../controllers/Sales/recordPaymentController");

router.put("/recordPayment", recordPaymentController.recordPayment);
module.exports = router;
