const express = require("express");
const router = express.Router();
const categoryMasterController = require("../../controllers/Master/categoryMasterController");

router.get("/categorylvl1", categoryMasterController.getCategorylvl1);
router.get(
  "/categorylvl2/:categoryLvl1Id",
  categoryMasterController.getCategorylvl2
);
router.get(
  "/categorylvl3/:categoryLvl2Id",
  categoryMasterController.getCategorylvl3
);
router.post("/categorylvl1", categoryMasterController.createCategorylvl1);
router.post("/categorylvl2", categoryMasterController.createCategorylvl2);
router.post("/categorylvl3", categoryMasterController.createCategorylvl3);
router.put("/categorylvl1/:id", categoryMasterController.updateCategorylvl1);
router.put("/categorylvl2/:id", categoryMasterController.updateCategorylvl2);
router.put("/categorylvl3/:id", categoryMasterController.updateCategorylvl3);
router.delete("/categorylvl1/:id", categoryMasterController.deleteCategorylvl1);
router.delete("/categorylvl2/:id", categoryMasterController.deleteCategorylvl2);
// router.delete("/categorylvl3/:id", categoryMasterController.deleteCategorylvl3);
module.exports = router;
