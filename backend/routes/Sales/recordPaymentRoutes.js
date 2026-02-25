const express = require("express");
const router = express.Router();

const recordPaymentController = require("../../controllers/Sales/recordPaymentController");

router.post(
  "/ProcessRecordPayment",
  recordPaymentController.processRecordPayment,
);
router.put("/recordPayment", recordPaymentController.recordPayment);

module.exports = router;
