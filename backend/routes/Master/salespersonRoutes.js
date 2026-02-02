const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Master/salespersonMasterController");

router.post("/salespersons", controller.createSalesperson);
router.put("/salespersons/:id", controller.updateSalesperson);
router.get("/salespersons", controller.getSalespersons);
router.patch("/salespersons/:id/toggle", controller.toggleSalesperson);
router.delete("/salespersons/:id", controller.deleteSalesperson);

module.exports = router;
