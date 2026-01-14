const db = require("../../config/db");
const client_id = "940T0003";

/* =========================
   GET PO HEADER
========================= */
exports.getPOHeader = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM po_header po
      JOIN supplier_master sm
        ON po."Supplier_Code" = sm."Supplier_Code"
      WHERE po."Client_ID" = $1
        AND po."PO_Status" = 'O'
      ORDER BY po."Creation_Date" DESC
      `,
      [client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET PO HEADER BY ID
========================= */
exports.getPOHeaderByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM po_header
      WHERE "PO_Code" = $1
        AND "Client_ID" = $2
        AND "PO_Status" = 'O'
      `,
      [req.params.id, client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET PO TRAN BY ID
========================= */
exports.getPOTranByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM po_tran
      WHERE "PO_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   CREATE PO
========================= */
exports.createPO = async (req, res) => {
  const { product_list, po_header_data, total_tax, total_sum } = req.body;
  const {
    PO_Date,
    DeliveryDate,
    PO_Status,
    Supplier,
    Location,
    TaxGroup,
    Delivery_Address,
  } = po_header_data;

  const userID = "01";
  const now = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* =========================
       1️⃣ Generate PO_Code
    ========================= */
    const { rows } = await client.query(
      `
      SELECT "PO_Code"
      FROM po_header
      WHERE "Client_ID" = $1
      ORDER BY "PO_Code" DESC
      LIMIT 1
      `,
      [client_id]
    );

    let nextId = "PO0000000001";
    if (rows.length) {
      const num = parseInt(rows[0].PO_Code.substring(2), 10) + 1;
      nextId = `PO${String(num).padStart(10, "0")}`;
    }

    /* =========================
       2️⃣ Insert PO Header
    ========================= */
    await client.query(
      `
      INSERT INTO po_header (
        "PO_Code","Supplier_Code","PO_Date","PO_Delivery_Date",
        "PO_Tax_Amount","PO_Amount","PO_Delivery_To",
        "Tax_Group_Code","UserID","Creation_Date",
        "PO_Status","Client_ID","Location_ID"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `,
      [
        nextId,
        Supplier,
        PO_Date,
        DeliveryDate,
        total_tax,
        total_sum,
        Delivery_Address,
        TaxGroup,
        userID,
        now,
        PO_Status,
        client_id,
        Location,
      ]
    );

    /* =========================
       3️⃣ Prepare UNNEST arrays
    ========================= */
    const po_codes = [];
    const entry_dates = [];
    const product_ids = [];
    const barcodes = [];
    const product_ums = [];
    const qtys = [];
    const prices = [];
    const disc_percents = [];
    const disc_amounts = [];
    const totals = [];
    const users = [];
    const descriptions = [];
    const clients = [];
    const locations = [];
    const tax_rates = [];
    const tax_amounts = [];
    const tax_groups = [];

    product_list.forEach((item) => {
      const p = item.selectedProduct || {};

      po_codes.push(nextId);
      entry_dates.push(now);
      product_ids.push(p.Product_ID || "");
      barcodes.push(p.Barcode || "");
      product_ums.push(p.Stock_UM || "");
      qtys.push(Number(item.quantity) || 0);
      prices.push(Number(item.unitPrice) || 0);
      disc_percents.push(Number(item.discountRate) || 0);
      disc_amounts.push(Number(item.discountAmount) || 0);
      totals.push(Number(item.total) || 0);
      users.push(userID);
      descriptions.push(p.Description || "");
      clients.push(client_id);
      locations.push(Location);
      tax_rates.push(0);
      tax_amounts.push(Number(item.taxAmount) || 0);
      tax_groups.push(item.TaxGroup || "");
    });

    /* =========================
       4️⃣ Bulk insert using UNNEST
    ========================= */
    await client.query(
      `
      INSERT INTO po_tran (
        "PO_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "PO_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","UserID","Description",
        "Client_ID","Location_ID","Tax_Rate","Tax_Amount","Tax_Group_Code"
      )
      SELECT *
      FROM UNNEST(
        $1::varchar[],
        $2::timestamp[],
        $3::varchar[],
        $4::varchar[],
        $5::varchar[],
        $6::numeric[],
        $7::numeric[],
        $8::numeric[],
        $9::numeric[],
        $10::numeric[],
        $11::varchar[],
        $12::varchar[],
        $13::varchar[],
        $14::varchar[],
        $15::numeric[],
        $16::numeric[],
        $17::varchar[]
      )
      `,
      [
        po_codes,
        entry_dates,
        product_ids,
        barcodes,
        product_ums,
        qtys,
        prices,
        disc_percents,
        disc_amounts,
        totals,
        users,
        descriptions,
        clients,
        locations,
        tax_rates,
        tax_amounts,
        tax_groups,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Purchase Order added successfully",
      PO_Code: nextId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};

exports.updatePO = async (req, res) => {
  const { PO_Code } = req.params;
  const { product_list, po_header_data, total_tax, total_sum } = req.body;

  const {
    PO_Date,
    DeliveryDate,
    PO_Status,
    Supplier,
    Location,
    TaxGroup,
    Delivery_Address,
  } = po_header_data;

  const client_id = req.user?.client_id;
  const userID = "01";
  const now = new Date();

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* =========================
       1️⃣ Update PO Header
    ========================= */
    const updateHeaderResult = await client.query(
      `
      UPDATE po_header
      SET
        "Supplier_Code"     = $1,
        "PO_Date"           = $2,
        "PO_Delivery_Date"  = $3,
        "PO_Tax_Amount"     = $4,
        "PO_Amount"         = $5,
        "PO_Delivery_To"    = $6,
        "Tax_Group_Code"    = $7,
        "PO_Status"         = $8,
        "Modified_By"       = $9,
        "Modified_Date"     = $10,
        "Location_ID"       = $11
      WHERE "PO_Code" = $12
        AND "Client_ID" = $13
      `,
      [
        Supplier,
        PO_Date,
        DeliveryDate,
        total_tax,
        total_sum,
        Delivery_Address,
        TaxGroup,
        PO_Status,
        userID,
        now,
        Location,
        PO_Code,
        client_id,
      ]
    );

    if (updateHeaderResult.rowCount === 0) {
      throw new Error("PO Header not found or not updated");
    }

    /* =========================
       2️⃣ Delete old PO lines
    ========================= */
    await client.query(
      `
      DELETE FROM po_tran
      WHERE "PO_Code" = $1
        AND "Client_ID" = $2
      `,
      [PO_Code, client_id]
    );

    /* =========================
       3️⃣ Prepare UNNEST arrays
    ========================= */
    const po_codes = [];
    const entry_dates = [];
    const product_ids = [];
    const barcodes = [];
    const product_ums = [];
    const qtys = [];
    const prices = [];
    const disc_percents = [];
    const disc_amounts = [];
    const totals = [];
    const users = [];
    const descriptions = [];
    const clients = [];
    const locations = [];
    const tax_rates = [];
    const tax_amounts = [];
    const tax_groups = [];

    product_list.forEach((item) => {
      const p = item.selectedProduct || {};

      po_codes.push(PO_Code);
      entry_dates.push(now);
      product_ids.push(p.Product_ID || "");
      barcodes.push(p.Barcode || "");
      product_ums.push(p.Stock_UM || "");
      qtys.push(Number(item.quantity) || 0);
      prices.push(Number(item.unitPrice) || 0);
      disc_percents.push(Number(item.discountRate) || 0);
      disc_amounts.push(Number(item.discountAmount) || 0);
      totals.push(Number(item.total) || 0);
      users.push(userID);
      descriptions.push(p.Description || "");
      clients.push(client_id);
      locations.push(Location);
      tax_rates.push(0);
      tax_amounts.push(Number(item.taxAmount) || 0);
      tax_groups.push(item.TaxGroup || "");
    });

    /* =========================
       4️⃣ Bulk insert using UNNEST
    ========================= */
    if (po_codes.length > 0) {
      await client.query(
        `
        INSERT INTO po_tran (
          "PO_Code","Entry_Date","Product_ID","Barcode","Product_UM",
          "PO_Qty","Unit_Price","Discount_Percent","Discount_Amount",
          "Total_Amount","UserID","Description",
          "Client_ID","Location_ID","Tax_Rate","Tax_Amount","Tax_Group_Code"
        )
        SELECT *
        FROM UNNEST(
          $1::varchar[],
          $2::timestamp[],
          $3::varchar[],
          $4::varchar[],
          $5::varchar[],
          $6::numeric[],
          $7::numeric[],
          $8::numeric[],
          $9::numeric[],
          $10::numeric[],
          $11::varchar[],
          $12::varchar[],
          $13::varchar[],
          $14::varchar[],
          $15::numeric[],
          $16::numeric[],
          $17::varchar[]
        )
        `,
        [
          po_codes,
          entry_dates,
          product_ids,
          barcodes,
          product_ums,
          qtys,
          prices,
          disc_percents,
          disc_amounts,
          totals,
          users,
          descriptions,
          clients,
          locations,
          tax_rates,
          tax_amounts,
          tax_groups,
        ]
      );
    }

    await client.query("COMMIT");

    return res.json({
      message: "Purchase Order updated successfully",
      PO_Code,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update PO Error:", error);

    return res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/* =========================
   DELETE PO
========================= */
exports.deletePO = async (req, res) => {
  const { PO_Code } = req.params;
  const userID = "01";
  const now = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE po_header
      SET "PO_Status" = 'D',
          "Edited_User" = $1,
          "Edited_Date" = $2
      WHERE "PO_Code" = $3
        AND "Client_ID" = $4
      `,
      [userID, now, PO_Code, client_id]
    );

    if (!result.rowCount) {
      throw new Error("PO Header update failed");
    }

    await client.query(
      `
      DELETE FROM po_tran
      WHERE "PO_Code" = $1
        AND "Client_ID" = $2
      `,
      [PO_Code, client_id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Purchase Order deleted successfully",
      PO_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};
