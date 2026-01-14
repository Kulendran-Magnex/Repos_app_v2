const express = require("express");
const router = express.Router();
const supplierMasterController = require("../../controllers/Master/supplierMasterController");

router.get("/supplierMaster", supplierMasterController.getSupplierMaster);
router.get(
  "/supplierMasterList",
  supplierMasterController.getSupplierMasterList
);

module.exports = router;
