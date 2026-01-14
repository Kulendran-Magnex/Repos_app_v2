const express = require("express");
const router = express.Router();
const cardMasterController = require("../../controllers/Master/cardMasterController");

router.get("/cardMaster", cardMasterController.getCardMaster);
router.post("/cardMaster", cardMasterController.createCardMaster);
router.put("/cardMaster/:id", cardMasterController.updateCardMaster);
router.delete("/cardMaster/:id", cardMasterController.deleteCardMaster);

module.exports = router;
