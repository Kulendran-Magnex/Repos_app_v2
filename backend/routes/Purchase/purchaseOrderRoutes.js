const express = require("express");
const router = express.Router();

const purchaseOrderController = require("../../controllers/Purchase/purchaseOrderController");

router.get("/PO_Header", purchaseOrderController.getPOHeader);
router.get("/PO_Header/:id", purchaseOrderController.getPOHeaderByID);
router.get("/PO_Tran/:id", purchaseOrderController.getPOTranByID);
router.put("/purchaseOrder/:id", purchaseOrderController.updatePO);
router.post("/purchaseOrder", purchaseOrderController.createPO);

module.exports = router;
