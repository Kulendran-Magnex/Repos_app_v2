const express = require("express");
const router = express.Router();
const brandMasterController = require("../../controllers/Master/brandMasterController");

router.get("/brandMaster", brandMasterController.getBrandMaster);
router.post("/brandMaster", brandMasterController.createBrandMaster);
router.put("/brandMaster/:id", brandMasterController.updateBrandMaster);
router.delete("/brandMaster/:id", brandMasterController.deleteBrandMaster);

module.exports = router;
