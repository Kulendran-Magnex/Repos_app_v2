const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/Inventory/customerController");

router.get("/customers", customerController.getCustomers);
router.post("/customers", customerController.createCustomer);
router.put("/customers/:id", customerController.updateCustomer);

module.exports = router;
