const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/Master/productRoutes");
const locationRoutes = require("./routes/Master/locationRoutes");
const brandMasterRoutes = require("./routes/Master/brandMasterRoutes");
const taxMasterRoutes = require("./routes/Master/taxMasterRoutes");
const cardMasterRoutes = require("./routes/Master/cardMasterRoutes");
const currencyMasterRoutes = require("./routes/Master/currencyMasterRoutes");
const categoryMasterRoutes = require("./routes/Master/categoryMasterRoutes");
const packingMasterRoutes = require("./routes/Master/packingMasterRoutes");
const materialRequestRoutes = require("./routes/Purchase/materialRequestRoutes");
const supplierMasterRoutes = require("./routes/Master/supplierMasterRoutes");
const purchaseOrderRoutes = require("./routes/Purchase/purchaseOrderRoutes");
const grnRoutes = require("./routes/Purchase/grnRoutes");
const purchaseReturnRoutes = require("./routes/Purchase/purchaseReturnRoutes");
const taxRoutes = require("./routes/taxRoutes");

app.use("/auth", authRoutes);
app.use("/", productRoutes);
app.use("/api", packingMasterRoutes);
app.use("/api", locationRoutes);
app.use("/api", brandMasterRoutes);
app.use("/api", taxMasterRoutes);
app.use("/api", cardMasterRoutes);
app.use("/api", currencyMasterRoutes);
app.use("/api", categoryMasterRoutes);
app.use("/api", materialRequestRoutes);
app.use("/api", supplierMasterRoutes);
app.use("/api", purchaseOrderRoutes);
app.use("/api", grnRoutes);
app.use("/api", purchaseReturnRoutes);
app.use("/api", taxRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
