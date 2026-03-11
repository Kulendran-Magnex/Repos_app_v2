const express = require("express");
const router = express.Router();
const productController = require("../../controllers/Master/productController");
const locationController = require("../../controllers/Master/locationController");

router.get("/catlvl1", productController.getCategories);
router.get("/products", productController.getProducts);
router.get("/fetchProducts", productController.fetchProducts);
router.get("/products/:product_id", productController.getProductOne);
router.get(
  "/productsDetails/:product_id",
  productController.getProductDetailsByID,
);
router.post("/products/add", productController.createProduct);
router.put("/products/:id", productController.updateProductByID);
router.post("/productDetails/add", productController.createProductDetails);
router.post("/productPrice/add", productController.createProductPrice);
router.delete(
  "/productDetails/:barcode",
  productController.deleteProductDetails,
);
router.delete("/productPrice/:barcode", productController.deleteProductPrice);
router.put("/productDetails/:barcode", productController.updateProductDetails);
router.get("/price/:id", productController.getProductPrice);
// router.put("/price/:id", productController.updateProductPriceById);
router.post("/getAverageCost", productController.getAverageCostByBarcode);

// Add other endpoints similarly

module.exports = router;
