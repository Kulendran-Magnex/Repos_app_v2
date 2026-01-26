const express = require("express");
const router = express.Router();
const productController = require("../../controllers/Master/productController");
const locationController = require("../../controllers/Master/locationController");
const authenticateUser = require("../../middlewares/authMiddleware");

// router.use(authenticateUser);

router.get("/catlvl1", productController.getCategories);
router.get("/products", productController.getProducts);
router.get("/searchProducts", productController.searchProducts);
router.get("/products/:product_id", productController.getProductOne);
router.get(
  "/productsDetails/:product_id",
  productController.getProductDetailsByID,
);
router.put("/products/:id", productController.updateProductByID);
// router.post("/productDetails/add", productController.insertProductDetails);
// router.post("/productPrice/add", productController.insertProductPrice);
// router.put("/productDetails/:id", productController.updateProductDetails);
router.get("/price/:id", productController.getProductPrice);
// router.put("/price/:id", productController.updateProductPriceById);
router.post("/getAverageCost", productController.getAverageCostByBarcode);

// Add other endpoints similarly

module.exports = router;
