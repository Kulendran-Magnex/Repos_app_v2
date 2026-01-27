const db = require("../../config/db");
const client_id = "940T0003";

exports.getTransferHeaders = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM transfer_header
      WHERE "Client_ID" = $1
      ORDER BY "Creation_Date" DESC
      `,
      [client_id],
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

exports.getTransferHeaderByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM transfer_header
      WHERE "Transfer_ID" = $1
        AND "Client_ID" = $2
      ORDER BY "Creation_Date" DESC
      `,
      [req.params.id, client_id],
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

exports.getTransferTranByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM transfer_detail
      WHERE "Transfer_ID" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id],
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

exports.createTransfer = async (req, res) => {
  // const client_id = req.user?.client_id; // from token later
  const client_id = "940T0003";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { transferHeaderData, product_list } = req.body;

  const {
    Created_By,
    Transfer_Date,
    From_Location,
    To_Location,
    Status,
    Remarks,
  } = transferHeaderData;

  const currentDate = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ===============================
       1️⃣ Get last Adjustment ID
    =============================== */
    const { rows } = await client.query(
      `
      SELECT "Transfer_ID"
      FROM transfer_header
      WHERE "Client_ID" = $1
      ORDER BY "Transfer_ID" DESC
      LIMIT 1
      `,
      [client_id],
    );

    let nextId = "TRA0000000001";

    if (rows.length > 0) {
      const lastNumber = parseInt(rows[0].Transfer_ID.substring(3), 10);
      nextId = `TRA${String(lastNumber + 1).padStart(10, "0")}`;
    }

    /* ===============================
       2️⃣ Insert Transfer Header
    =============================== */
    await client.query(
      `
      INSERT INTO transfer_header (
        "Transfer_ID",
        "Location_From_ID",
        "Location_To_ID",
        "Created_By",
        "Creation_Date",
        "Transfer_Date",
        "Status",
        "Remarks",
        "Client_ID"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        nextId,
        From_Location,
        To_Location,
        Created_By,
        currentDate,
        Transfer_Date,
        Status,
        Remarks,
        client_id,
      ],
    );

    //need to implement to transfer deatails insertion

    const Transfer_IDs = [];
    const From_Locations = [];
    const Product_IDs = [];
    const Descriptions = [];
    const Transfer_UMs = [];
    const Transfer_QTYs = [];
    const Transfer_Costs = [];
    const Unit_Costs = [];
    const Entry_Dates = [];
    const Barcodes = [];
    const Client_IDs = [];

    product_list.forEach((item) => {
      const p = item.data || {};

      Transfer_IDs.push(nextId);
      From_Locations.push(From_Location);
      Product_IDs.push(p.Product_ID || "");
      Descriptions.push(p.Description || "");
      Transfer_UMs.push(p.Product_UM || p.UOM || "");
      Transfer_QTYs.push(Number(item.quantity) || 0);
      Transfer_Costs.push(Number(item.total) || 0);
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
      INSERT INTO transfer_detail (
        "Transfer_ID",
        "Location_From_ID",
        "Product_ID",
        "Description",
        "Transfer_UM",
        "Transfer_QTY",
        "Transfer_Cost",
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
        Transfer_IDs,
        From_Locations,
        Product_IDs,
        Descriptions,
        Transfer_UMs,
        Transfer_QTYs,
        Transfer_Costs,
        Unit_Costs,
        Entry_Dates,
        Barcodes,
        Client_IDs,
      ],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Transfer added successfully",
      Transfer_Code: nextId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transfer Transaction Error:", err);

    return res.status(500).json({
      message: "Database error",
      error: err.message,
    });
  } finally {
    client.release();
  }
};

exports.updateTransfer = async (req, res) => {
  const { Transfer_Code } = req.params;
  // const client_id = req.user?.client_id;
  const client_id = "940T0003";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { headerData, productList } = req.body;

  const {
    Created_By,
    Transfer_Date,
    From_Location,
    To_Location,
    Status,
    Remarks,
  } = headerData;

  const currentDate = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ===============================
       1️⃣ Update Adjustment Header
    =============================== */
    const updateHeaderResult = await client.query(
      `
      UPDATE transfer_header
      SET
        "Location_From_ID"     = $1,
        "Location_To_ID"    =$2,
        "Modified_By"     = $3,
        "Modified_Date"   = $4,
        "Transfer_Date" = $5,
        "Status"          = $6,
        "Remarks"         = $7
      WHERE "Transfer_ID" = $8
        AND "Client_ID"     = $9
      `,
      [
        From_Location,
        To_Location,
        Created_By,
        currentDate,
        Transfer_Date,
        Status,
        Remarks,
        Transfer_Code,
        client_id,
      ],
    );

    if (updateHeaderResult.rowCount === 0) {
      throw new Error("Transfer header not found or not updated");
    }

    /* ===============================
       2️⃣ Delete old details
    =============================== */
    await client.query(
      `
      DELETE FROM transfer_detail
      WHERE "Transfer_ID" = $1
        AND "Client_ID"     = $2
      `,
      [Transfer_Code, client_id],
    );

    /* ===============================
       3️⃣ Prepare UNNEST arrays
    =============================== */
    if (Array.isArray(productList) && productList.length > 0) {
      const Transfer_IDs = [];
      const From_Locations = [];
      const Product_IDs = [];
      const Descriptions = [];
      const Transfer_UMs = [];
      const Transfer_QTYs = [];
      const Transfer_Costs = [];
      const Unit_Costs = [];
      const Entry_Dates = [];
      const Barcodes = [];
      const Client_IDs = [];

      productList.forEach((item) => {
        Transfer_IDs.push(Transfer_Code);
        From_Locations.push(From_Location);
        Product_IDs.push(item.Product_ID || "");
        Descriptions.push(item.Description || "");
        Transfer_UMs.push(item.Product_UM || item.UOM || "");
        Transfer_QTYs.push(Number(item.quantity) || 0);
        Transfer_Costs.push(Number(item.Total_Amount) || 0);
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
        INSERT INTO transfer_detail (
          "Transfer_ID",
          "Location_From_ID",
          "Product_ID",
          "Description",
          "Transfer_UM",
          "Transfer_QTY",
          "Transfer_Cost",
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
          Transfer_IDs,
          From_Locations,
          Product_IDs,
          Descriptions,
          Transfer_UMs,
          Transfer_QTYs,
          Transfer_Costs,
          Unit_Costs,
          Entry_Dates,
          Barcodes,
          Client_IDs,
        ],
      );
    }

    await client.query("COMMIT");

    return res.json({
      message: "Transfer updated successfully",
      Transfer_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Transfer Error:", err);

    return res.status(500).json({
      message: "Database error",
      error: err.message,
    });
  } finally {
    client.release();
  }
};
