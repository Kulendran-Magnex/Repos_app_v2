const express = require("express");
const router = express.Router();

const adjustmentController = require("../../controllers/Inventory/adjustmentController");

router.get("/adjustment_header", adjustmentController.getAdjustmentHeader);
router.get(
  "/adjustment_header/:id",
  adjustmentController.getAdjustmentHeaderByID,
);
router.get(
  "/adjustment_detail/:id",
  adjustmentController.getAdjustmentTranByID,
);
router.post("/adjustment", adjustmentController.createAdjustment);
router.put("/adjustment/:ADJ_Code", adjustmentController.updateAdjustment);
module.exports = router;
