const express = require("express");
const router = express.Router();
const packingMasterController = require("../../controllers/Master/packingMasterController");
const authenticateUser = require("../../middlewares/authMiddleware");

// router.use(authenticateUser);

router.get("/packingMaster", packingMasterController.getPackingMaster);
// router.post("/packingMasterById", packingMasterController.getPackingMasterById);
router.post("/packingMaster", packingMasterController.createPackingMaster);
router.put("/packingMaster/:id", packingMasterController.updatePackingMaster);
router.delete(
  "/packingMaster/:id",
  packingMasterController.deletePackingMaster
);
module.exports = router;
