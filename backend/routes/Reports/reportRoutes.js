const express = require("express");
const router = express.Router();

const salesSummaryReportController = require("../../controllers/Reports/salesSummaryReportController");

router.get("/sales-summary", salesSummaryReportController.getSalesSummary);

module.exports = router;
