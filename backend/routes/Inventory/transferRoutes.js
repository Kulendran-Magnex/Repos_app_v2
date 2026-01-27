const express = require("express");
const router = express.Router();
const transferController = require("../../controllers/Inventory/transferController");

router.get("/transfer/header", transferController.getTransferHeaders);
router.get("/transfer/header/:id", transferController.getTransferHeaderByID);
router.get("/transfer/tran/:id", transferController.getTransferTranByID);
router.post("/transfer", transferController.createTransfer);
router.put("/transfer/:Transfer_Code", transferController.updateTransfer);
module.exports = router;
