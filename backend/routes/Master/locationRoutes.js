const express = require("express");
const router = express.Router();
const locationController = require("../../controllers/Master/locationController");

router.get("/location", locationController.getLocation);
router.get("/locationInfo", locationController.getLocationInfo);

module.exports = router;
