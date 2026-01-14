const express = require("express");
const router = express.Router();
const materialrequestController = require("../../controllers/Purchase/materialRequestController");

router.get("/MR_Header", materialrequestController.getMRHeader);
router.get("/MR_Header/:id", materialrequestController.getMRHeaderByID);
router.get("/mr_Tran/:id", materialrequestController.getMRTranByID);
router.get(
  "/mr_Tran_with_uprice/:id",
  materialrequestController.getMRTranWithUPrice
);
router.post("/mr_Tran", materialrequestController.createMR);
router.put("/mr_Tran/:MR_Code", materialrequestController.updateMR);
router.post("/mr_Tran_Close", materialrequestController.closeMaterialRequest);
router.delete("/mr_Tran/:MR_Code", materialrequestController.deleteMR);
router.delete("/mr_Tran_Close/:MR_Code", materialrequestController.closeMR);
module.exports = router;
