const db = require("../../config/db");
const client_id = "940T0003";

/* ================================
   Get Adjustment Header (All)
================================ */
exports.getAdjustmentHeader = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM adjustment_header
      WHERE "Client_ID" = $1
      ORDER BY "Creation_Date" DESC
      `,
      [client_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

/* ================================
   Get Adjustment Header By ID
================================ */
exports.getAdjustmentHeaderByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM adjustment_header
      WHERE "Adjustment_ID" = $1
        AND "Client_ID" = $2
      ORDER BY "Creation_Date" DESC
      `,
      [req.params.id, client_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

/* ================================
   Get Adjustment Detail By ID
================================ */
exports.getAdjustmentranByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM adjustment_detail
      WHERE "Adjustment_ID" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.createAdjustment = async (req, res) => {
  // const client_id = req.user?.client_id; // from token later
  const client_id = "940T0003";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { adjHeaderData, product_list } = req.body;

  const { Created_By, Adj_Date, Location, Posting_Type, Adj_Status, Remarks } =
    adjHeaderData;

  const currentDate = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ===============================
       1️⃣ Get last Adjustment ID
    =============================== */
    const { rows } = await client.query(
      `
      SELECT "Adjustment_ID"
      FROM adjustment_header
      WHERE "Client_ID" = $1
      ORDER BY "Adjustment_ID" DESC
      LIMIT 1
      `,
      [client_id]
    );

    let nextId = "ADJ0000000001";

    if (rows.length > 0) {
      const lastNumber = parseInt(rows[0].Adjustment_ID.substring(3), 10);
      nextId = `ADJ${String(lastNumber + 1).padStart(10, "0")}`;
    }

    /* ===============================
       2️⃣ Insert Adjustment Header
    =============================== */
    await client.query(
      `
      INSERT INTO adjustment_header (
        "Adjustment_ID",
        "Location_ID",
        "Created_By",
        "Creation_Date",
        "Adjustment_Date",
        "Status",
        "Remarks",
        "Posting_Type",
        "Client_ID"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        nextId,
        Location,
        Created_By,
        currentDate,
        Adj_Date,
        Adj_Status,
        Remarks,
        Posting_Type,
        client_id,
      ]
    );

    /* ===============================
       3️⃣ Prepare UNNEST arrays
    =============================== */
    const Adjustment_IDs = [];
    const Location_IDs = [];
    const Product_IDs = [];
    const Descriptions = [];
    const Adjustment_UMs = [];
    const Adjustment_QTYs = [];
    const Adjustment_Costs = [];
    const Unit_Costs = [];
    const Entry_Dates = [];
    const Barcodes = [];
    const Client_IDs = [];

    product_list.forEach((item) => {
      const p = item.adjData || {};

      Adjustment_IDs.push(nextId);
      Location_IDs.push(Location);
      Product_IDs.push(p.Product_ID || "");
      Descriptions.push(p.Description || "");
      Adjustment_UMs.push(p.Product_UM || p.UOM || "");
      Adjustment_QTYs.push(Number(item.quantity) || 0);
      Adjustment_Costs.push(Number(item.total) || 0);
      Unit_Costs.push(Number(item.unitPrice) || 0);
      Entry_Dates.push(currentDate);
      Barcodes.push(p.Barcode || "");
      Client_IDs.push(client_id);
    });

    /* ===============================
       4️⃣ Insert Adjustment Details (UNNEST)
    =============================== */
    await client.query(
      `
      INSERT INTO adjustment_detail (
        "Adjustment_ID",
        "Location_ID",
        "Product_ID",
        "Description",
        "Adjustment_UM",
        "Adjustment_QTY",
        "Adjustment_Cost",
        "Unit_Cost",
        "Entry_Date",
        "Barcode",
        "Client_ID"
      )
      SELECT *
      FROM UNNEST(
        $1::varchar[],
        $2::varchar[],
        $3::varchar[],
        $4::varchar[],
        $5::varchar[],
        $6::numeric[],
        $7::numeric[],
        $8::numeric[],
        $9::timestamp[],
        $10::varchar[],
        $11::varchar[]
      )
      `,
      [
        Adjustment_IDs,
        Location_IDs,
        Product_IDs,
        Descriptions,
        Adjustment_UMs,
        Adjustment_QTYs,
        Adjustment_Costs,
        Unit_Costs,
        Entry_Dates,
        Barcodes,
        Client_IDs,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Adjustment added successfully",
      Adjustment_Code: nextId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Adjustment Transaction Error:", err);

    return res.status(500).json({
      message: "Database error",
      error: err.message,
    });
  } finally {
    client.release();
  }
};

exports.updateAdjustment = async (req, res) => {
  const { ADJ_Code } = req.params;
  // const client_id = req.user?.client_id;
  const client_id = "940T0003";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { adjHeaderData, productList } = req.body;

  const { Created_By, Adj_Date, Location, Posting_Type, Adj_Status, Remarks } =
    adjHeaderData;

  const currentDate = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ===============================
       1️⃣ Update Adjustment Header
    =============================== */
    const updateHeaderResult = await client.query(
      `
      UPDATE adjustment_header
      SET
        "Location_ID"     = $1,
        "Modified_By"     = $2,
        "Modified_Date"   = $3,
        "Adjustment_Date" = $4,
        "Status"          = $5,
        "Remarks"         = $6,
        "Posting_Type"    = $7
      WHERE "Adjustment_ID" = $8
        AND "Client_ID"     = $9
      `,
      [
        Location,
        Created_By,
        currentDate,
        Adj_Date,
        Adj_Status,
        Remarks,
        Posting_Type,
        ADJ_Code,
        client_id,
      ]
    );

    if (updateHeaderResult.rowCount === 0) {
      throw new Error("Adjustment header not found or not updated");
    }

    /* ===============================
       2️⃣ Delete old details
    =============================== */
    await client.query(
      `
      DELETE FROM adjustment_detail
      WHERE "Adjustment_ID" = $1
        AND "Client_ID"     = $2
      `,
      [ADJ_Code, client_id]
    );

    /* ===============================
       3️⃣ Prepare UNNEST arrays
    =============================== */
    if (Array.isArray(productList) && productList.length > 0) {
      const Adjustment_IDs = [];
      const Location_IDs = [];
      const Product_IDs = [];
      const Descriptions = [];
      const Adjustment_UMs = [];
      const Adjustment_QTYs = [];
      const Adjustment_Costs = [];
      const Unit_Costs = [];
      const Entry_Dates = [];
      const Barcodes = [];
      const Client_IDs = [];

      productList.forEach((item) => {
        Adjustment_IDs.push(ADJ_Code);
        Location_IDs.push(Location);
        Product_IDs.push(item.Product_ID || "");
        Descriptions.push(item.Description || "");
        Adjustment_UMs.push(item.Product_UM || item.UOM || "");
        Adjustment_QTYs.push(Number(item.quantity) || 0);
        Adjustment_Costs.push(Number(item.Total_Amount) || 0);
        Unit_Costs.push(Number(item.unitPrice) || 0);
        Entry_Dates.push(currentDate);
        Barcodes.push(item.Barcode || "");
        Client_IDs.push(client_id);
      });

      /* ===============================
         4️⃣ Insert new details (UNNEST)
      =============================== */
      await client.query(
        `
        INSERT INTO adjustment_detail (
          "Adjustment_ID",
          "Location_ID",
          "Product_ID",
          "Description",
          "Adjustment_UM",
          "Adjustment_QTY",
          "Adjustment_Cost",
          "Unit_Cost",
          "Entry_Date",
          "Barcode",
          "Client_ID"
        )
        SELECT *
        FROM UNNEST(
          $1::varchar[],
          $2::varchar[],
          $3::varchar[],
          $4::varchar[],
          $5::varchar[],
          $6::numeric[],
          $7::numeric[],
          $8::numeric[],
          $9::timestamp[],
          $10::varchar[],
          $11::varchar[]
        )
        `,
        [
          Adjustment_IDs,
          Location_IDs,
          Product_IDs,
          Descriptions,
          Adjustment_UMs,
          Adjustment_QTYs,
          Adjustment_Costs,
          Unit_Costs,
          Entry_Dates,
          Barcodes,
          Client_IDs,
        ]
      );
    }

    await client.query("COMMIT");

    return res.json({
      message: "Adjustment updated successfully",
      ADJ_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Adjustment Error:", err);

    return res.status(500).json({
      message: "Database error",
      error: err.message,
    });
  } finally {
    client.release();
  }
};
