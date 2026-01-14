const express = require("express");
const router = express.Router();
const grnController = require("../../controllers/Purchase/GRNController");
const authMiddleware = require("../../middlewares/authMiddleware");

// router.use(authMiddleware);
router.get("/GRN_Header", authMiddleware, grnController.getGRNHeader);
router.get("/GRN/Header/:id", authMiddleware, grnController.getGRNHeaderByID);
router.get(
  "/GRN_HeaderBySupplier/:supplierCode",
  authMiddleware,
  grnController.getGRNHeaderBySupplier
);

router.get("/GRN/Tran/:id", authMiddleware, grnController.getGRNTranByID);
router.post("/GRN", authMiddleware, grnController.createGRN);
router.put("/GRN/:id", authMiddleware, grnController.updateGRN);

module.exports = router;
