const express = require("express");
const router = express.Router();
const taxMasterController = require("../../controllers/Master/taxMasterController");

router.get("/taxMaster", taxMasterController.getTaxMaster);
router.post("/taxMaster", taxMasterController.createTaxMaster);
router.put("/taxMaster/:id", taxMasterController.updateTaxMaster);
router.delete("/taxMaster/:id", taxMasterController.deleteTaxMaster);

router.get("/taxGroup", taxMasterController.getTaxGroup);
router.post("/taxGroup", taxMasterController.createTaxGroup);
router.put("/taxGroup/:taxGroupCode", taxMasterController.updateTaxGroup);
router.delete("/taxGroups/:id", taxMasterController.deleteTaxGroup);

router.post("/calculate-tax", taxMasterController.getTaxFormula);
module.exports = router;
