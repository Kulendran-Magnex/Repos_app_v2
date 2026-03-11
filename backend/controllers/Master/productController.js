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
// exports.getProducts = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT DISTINCT
//         p."Product_ID",
//         p."Product_Ref",
//         c."Cat_Name",
//         p."Description",
//         pd."Unit_Cost",
//         pd."Barcode",
//         p."Stock_UM"
//       FROM "products" p
//       JOIN "product_details" pd ON p."Product_ID" = pd."Product_ID"
//       JOIN "product_price" pp ON p."Product_ID" = pp."Product_ID"
//       JOIN "category_lvl1" c ON p."Category_Lv1" = c."Cat_Code"
//       WHERE p."Client_ID" = $1`,
//       [client_id],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Data not found" });
//     }

//     res.json(result.rows);
//   } catch (err) {
//     console.error("DB Error:", err);
//     res.status(500).json({ message: "Database error" });
//   }
// };

exports.getProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT
        p."Product_ID",
        p."Product_Ref",
        c."Cat_Name",
        p."Description",
        p."Stock_UM"
      FROM "products" p
      JOIN "category_lvl1" c ON p."Category_Lv1" = c."Cat_Code"
      WHERE p."Client_ID" = $1`,
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
   FETCH PRODUCTS
========================= */
exports.fetchProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        p."Product_ID",
        pd."Barcode",
        c."Cat_Name",
        p."Category_Lv1",
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
      WHERE p."Client_ID" = $1`,
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
       WHERE "Client_ID" = $1
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
       WHERE "Client_ID" = $1
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

exports.createProduct = async (req, res) => {
  try {
    const user = "05";
    // Get last product ID
    const { rows } = await db.query(
      `
      SELECT "Product_ID"
      FROM products
      WHERE "Client_ID" = $1
      ORDER BY "Product_ID" DESC
      LIMIT 1
      `,
      [client_id],
    );

    let nextId = "P00000000001";

    if (rows.length > 0) {
      const lastNumber = parseInt(rows[0].Product_ID.substring(1), 10);
      nextId = `P${String(lastNumber + 1).padStart(11, "0")}`;
    }

    const {
      Product_Ref,
      Product_Status,
      Category_Lv1,
      Category_Lv2,
      Category_Lv3,
      Description,
      Description_Long,
      Product_Type,
      Stock_UM,
      Description2,
      Description_Long2,
      Base_UM,
      Stop_Sell,
      Taxable,
      Warranty_Period,
      Warranty_Type,
    } = req.body;

    const result = await db.query(
      `INSERT INTO "products" 
      ("Product_ID","Client_ID","Product_Ref","Product_Status","Category_Lv1","Category_Lv2","Category_Lv3","Description","Description_Long","Product_Type","Stock_UM","Description2","Description_Long2","Base_UM","Stop_Sell","Taxable","Warranty_Period","Warranty_Type","Modified_User")
      VALUES 
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *`,
      [
        nextId,
        client_id,
        Product_Ref,
        Product_Status,
        Category_Lv1,
        Category_Lv2,
        Category_Lv3,
        Description,
        Description_Long,
        Product_Type,
        Stock_UM,
        Description2,
        Description_Long2,
        Base_UM,
        Stop_Sell,
        Taxable,
        Number(Warranty_Period) || 0,
        Warranty_Type,
        user,
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Failed to create product", product_id: nextId });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.createProductDetails = async (req, res) => {
  const {
    Product_ID,
    Barcode,
    Description,
    Description_Long,
    Description2,
    Description_Long2,
    Product_UOM,
    UM_QTY,
    Unit_Cost,
    Last_Purchase_Price,
    Base_UM,
    Prod_Status,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO product_details 
      ("Product_ID", "Barcode", "Description", "Description_Long", "Description2", "Description_Long2",
       "Product_UOM", "UM_QTY", "Unit_Cost", "Last_Purchase_Price", "Base_UM", "Prod_Status" , "Client_ID")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        Product_ID,
        Barcode,
        Description,
        Description_Long,
        Description2,
        Description_Long2,
        Product_UOM,
        Number(UM_QTY) || 0,
        Number(Unit_Cost) || 0,
        Number(Last_Purchase_Price) || 0,
        Base_UM,
        Prod_Status || 1,
        client_id,
      ],
    );

    res.status(200).json({
      message: "Product details created successfully",
      data: result.rows[0],
      success: true,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Barcode already exists for this client.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateProductDetails = async (req, res) => {
  const { barcode } = req.params;
  const { priceDetails } = req.body;
  const {
    Product_ID,
    Description,
    Description_Long,
    Description2,
    Description_Long2,
    Product_UOM,
    UM_QTY,
    Unit_Cost,
    Last_Purchase_Price,
    Base_UM,
    Prod_Status,
  } = priceDetails;

  try {
    const result = await db.query(
      `UPDATE product_details SET
        "Product_ID" = $1,
        "Description" = $2,
        "Description_Long" = $3,
        "Description2" = $4,
        "Description_Long2" = $5,
        "Product_UOM" = $6,
        "UM_QTY" = $7,
        "Unit_Cost" = $8,
        "Last_Purchase_Price" = $9,
        "Base_UM" = $10,
        "Prod_Status" = $11
      WHERE "Barcode" = $12 AND "Client_ID" = $13
      RETURNING *`,
      [
        Product_ID,
        Description,
        Description_Long,
        Description2,
        Description_Long2,
        Product_UOM,
        Number(UM_QTY) || 0,
        Number(Unit_Cost) || 0,
        Number(Last_Purchase_Price) || 0,
        Base_UM,
        Prod_Status || 1,
        barcode,
        client_id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product details updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createProductPrice = async (req, res) => {
  const {
    Product_ID,
    Barcode,
    Location_Group,
    Retail_Price,
    Retail_Price2,
    Retail_Price3,
    Wholesale_Price,
    MRP,
    Prod_Status,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO product_price 
      ("Product_ID", "Barcode", "Location_Group", "Retail_Price", "Retail_Price2", "Retail_Price3", "Wholesale_Price", "MRP", "Prod_Status" , "Client_ID")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        Product_ID,
        Barcode,
        Location_Group,
        Number(Retail_Price) || 0,
        Number(Retail_Price2) || 0,
        Number(Retail_Price3) || 0,
        Number(Wholesale_Price) || 0,
        Number(MRP) || 0,
        Prod_Status || 1,
        client_id,
      ],
    );

    res.status(200).json({
      message: "Product price created successfully",
      data: result.rows[0],
      success: true,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Barcode already exists for this client.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
         AND "Client_ID"=$18`,
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
       WHERE "Client_ID" = $1
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

/* =========================
   DELETE PRODUCT DETAILS
========================= */
exports.deleteProductDetails = async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM "product_details"
       WHERE "Client_ID" = $1
         AND "Barcode" = $2`,
      [client_id, req.params.barcode],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product detail not found" });
    }

    res.json({ message: "Product detail deleted successfully", success: true });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   DELETE PRODUCT PRICE
========================= */
exports.deleteProductPrice = async (req, res) => {
  const { location_Group } = req.body;
  console.log("location ID:", location_Group);
  try {
    const result = await db.query(
      `DELETE FROM "product_price"
       WHERE "Client_ID" = $1
         AND "Barcode" = $2
         AND "Location_Group" = $3`,
      [client_id, req.params.barcode, location_Group],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product price not found" });
    }

    res.json({ message: "Product price deleted successfully", success: true });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};
