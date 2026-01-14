const express = require("express");
const router = express.Router();

const purchaseReturnController = require("../../controllers/Purchase/purchaseReturnController");

router.get("/PR_Header", purchaseReturnController.getPRHeader);
router.get("/PR_Header/:id", purchaseReturnController.getPRHeaderByID);
router.get("/PR_Tran/:id", purchaseReturnController.getPRTranByID);
router.post("/purchaseReturn", purchaseReturnController.createPR);
router.put("/purchaseReturn/:id", purchaseReturnController.updatePR);
module.exports = router;
