const express = require("express");
const router = express.Router();
const currencyMasterController = require("../../controllers/Master/currencyMasterController");

router.get("/currencyMaster", currencyMasterController.getCurrencyMaster);
router.post("/currencyMaster", currencyMasterController.createCurrencyMaster);
router.put(
  "/currencyMaster/:id",
  currencyMasterController.updateCurrencyMaster
);
router.delete(
  "/currencyMaster/:id",
  currencyMasterController.deleteCurrencyMaster
);
module.exports = router;
