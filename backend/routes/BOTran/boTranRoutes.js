const express = require("express");
const router = express.Router();
const boTranController = require("../../controllers/BOTran/BOTranController");

router.post("/bo_tranwithGRN/:GRN_Code", boTranController.createBOTranFromGRN);
router.post("/bo_tranwithPR/:PR_Code", boTranController.createBOTranWithPR);
router.post(
  "/bo_tranwithAdjustment/:AD_Code",
  boTranController.createBOTranFromAdjustment,
);

module.exports = router;
