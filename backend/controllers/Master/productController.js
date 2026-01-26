const db = require("../../config/db");
const client_id = "940T0003";

/* =========================
   CATEGORY LVL 1
========================= */
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "category_lvl1"
       WHERE "Client_id" = $1`,
      [client_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Error occurred" });
  }
};

/* =========================
   PRODUCT LIST
========================= */
exports.getProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT
        p."Product_ID",
        p."Product_Ref",
        c."Cat_Name",
        p."Description",
        pd."Unit_Cost",
        p."Stock_UM"
      FROM "products" p
      JOIN "product_details" pd ON p."Product_ID" = pd."Product_ID"
      JOIN "product_price" pp ON p."Product_ID" = pp."Product_ID"
      JOIN "category_lvl1" c ON p."Category_Lv1" = c."Cat_Code"
      WHERE p."Client_id" = $1`,
      [client_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   SEARCH PRODUCTS
========================= */
exports.searchProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        p."Product_ID",
        pd."Barcode",
        c."Cat_Name",
        p."Description",
        p."Description_Long",
        pp."Retail_Price",
        pp."MRP",
        p."Stock_UM",
        pd."UM_QTY",
        pd."Unit_Cost"
      FROM "products" p
      JOIN "product_details" pd ON p."Product_ID" = pd."Product_ID"
      JOIN "product_price" pp ON pd."Barcode" = pp."Barcode"
      JOIN "category_lvl1" c ON p."Category_Lv1" = c."Cat_Code"
      WHERE p."Client_id" = $1`,
      [client_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   SINGLE PRODUCT
========================= */
exports.getProductOne = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "products"
       WHERE "Client_id" = $1
         AND "Product_ID" = $2`,
      [client_id, req.params.product_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   PRODUCT DETAILS
========================= */
exports.getProductDetailsByID = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "product_details"
       WHERE "Client_id" = $1
         AND "Product_ID" = $2`,
      [client_id, req.params.product_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   UPDATE PRODUCT
========================= */
exports.updateProductByID = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE "products"
       SET
         "Product_Ref"=$1,
         "Product_Status"=$2,
         "Category_Lv1"=$3,
         "Category_Lv2"=$4,
         "Category_Lv3"=$5,
         "Description"=$6,
         "Description_Long"=$7,
         "Product_Type"=$8,
         "Stock_UM"=$9,
         "Description2"=$10,
         "Description_Long2"=$11,
         "Base_UM"=$12,
         "Stop_Sell"=$13,
         "Taxable"=$14,
         "Warranty_Period"=$15,
         "Warranty_Type"=$16
       WHERE "Product_ID"=$17
         AND "Client_id"=$18`,
      [...Object.values(req.body), req.params.id, client_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   PRODUCT PRICE
========================= */
exports.getProductPrice = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "product_price"
       WHERE "Client_id" = $1
         AND "Product_ID" = $2`,
      [client_id, req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getAverageCostByBarcode = async (req, res) => {
  try {
    const { barcode, clientId, locationId, date } = req.body;

    const result = await db.query(`SELECT getavaragecostbyid($1, $2, $3, $4)`, [
      barcode,
      clientId,
      locationId,
      date,
    ]);

    res.json({
      average_cost: result.rows[0].getavaragecostbyid,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};
