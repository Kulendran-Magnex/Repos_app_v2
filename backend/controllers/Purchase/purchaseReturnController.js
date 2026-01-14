const db = require("../../config/db");
const client_id = "940T0003";

/* =========================
   GET PR HEADER
========================= */
exports.getPRHeader = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT p.*, sm."Supplier_Name"
      FROM pr_header p
      JOIN supplier_master sm
        ON p."Supplier_Code" = sm."Supplier_Code"
      WHERE p."Client_ID" = $1
      ORDER BY p."Creation_Date" DESC
      `,
      [client_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET PR HEADER BY ID
========================= */
exports.getPRHeaderByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM pr_header
      WHERE "PR_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET PR TRAN BY ID
========================= */
exports.getPRTranByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM pr_tran
      WHERE "PR_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   CREATE PR (UNNEST)
========================= */
exports.createPR = async (req, res) => {
  const { prHeaderData, product_list, total_tax, total_sum } = req.body;
  const { Supplier, PR_Date, Invoice_No, PR_Status, Location, GRN_Code } =
    prHeaderData;

  const userID = "01";
  const now = new Date();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* 🔹 Generate PR Code */
    const { rows } = await client.query(
      `
      SELECT "PR_Code"
      FROM pr_header
      WHERE "Client_ID" = $1
      ORDER BY "PR_Code" DESC
      LIMIT 1
      `,
      [client_id]
    );

    let nextId = "PR0000000001";
    if (rows.length > 0) {
      const num = parseInt(rows[0].PR_Code.substring(2), 10) + 1;
      nextId = `PR${String(num).padStart(10, "0")}`;
    }

    /* 🔹 Insert Header */
    await client.query(
      `
      INSERT INTO pr_header (
        "PR_Code","Supplier_Code","PR_Date","Invoice_No",
        "PR_Amount","UserID","PR_Status","Creation_Date",
        "GRN_Code","Client_ID","Location_ID","PR_Tax_Amount"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
      [
        nextId,
        Supplier,
        PR_Date,
        Invoice_No,
        total_sum,
        userID,
        PR_Status,
        now,
        GRN_Code || null,
        client_id,
        Location,
        total_tax,
      ]
    );

    /* 🔹 Prepare UNNEST arrays */
    const pr_codes = [];
    const entry_dates = [];
    const product_ids = [];
    const barcodes = [];
    const product_ums = [];
    const qtys = [];
    const prices = [];
    const disc_percents = [];
    const disc_amounts = [];
    const totals = [];
    const descriptions = [];
    const tax_amounts = [];
    const tax_groups = [];
    const clients = [];

    product_list.forEach((item) => {
      const p = item.prData || {};

      pr_codes.push(nextId);
      entry_dates.push(now);
      product_ids.push(p.Product_ID || "");
      barcodes.push(p.Barcode || "");
      product_ums.push(p.Product_UM || p.UOM || "");
      qtys.push(Number(item.quantity) || 0);
      prices.push(Number(item.unitPrice) || 0);
      disc_percents.push(Number(item.discountRate) || 0);
      disc_amounts.push(Number(item.discountAmount) || 0);
      totals.push(Number(item.total) || 0);
      descriptions.push(p.Description || "");
      tax_amounts.push(Number(item.taxAmount) || 0);
      tax_groups.push(item.Tax_Group_Code || "");
      clients.push(client_id);
    });

    /* 🔹 Bulk insert using UNNEST */
    await client.query(
      `
      INSERT INTO pr_tran (
        "PR_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "PR_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","Description","Tax_Amount",
        "Tax_Group_Code","Client_ID"
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
        $12::numeric[],
        $13::varchar[],
        $14::varchar[]
      )
      `,
      [
        pr_codes,
        entry_dates,
        product_ids,
        barcodes,
        product_ums,
        qtys,
        prices,
        disc_percents,
        disc_amounts,
        totals,
        descriptions,
        tax_amounts,
        tax_groups,
        clients,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Purchase Return Created Successfully",
      PR_Code: nextId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};

/* =========================
   UPDATE PR (UNNEST)
========================= */
exports.updatePR = async (req, res) => {
  const PR_Code = req.params.id;
  const { prHeaderData, product_list, total_tax, total_sum } = req.body;
  const { Supplier, PR_Date, Invoice_No, PR_Status, Location } = prHeaderData;

  if (!Array.isArray(product_list) || product_list.length === 0) {
    return res.status(400).json({ message: "Product list cannot be empty" });
  }

  const currentDate = new Date();
  const userID = "01";
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* 🔹 Update PR Header */
    const updateHeaderQuery = `
      UPDATE pr_header
      SET
        "Supplier_Code" = $1,
        "PR_Date" = $2,
        "Invoice_No" = $3,
        "PR_Amount" = $4,
        "UserID" = $5,
        "PR_Status" = $6,
        "Modified_Date" = $7,
        "Location_ID" = $8,
        "PR_Tax_Amount" = $9
      WHERE "PR_Code" = $10
        AND "Client_ID" = $11
    `;

    const headerResult = await client.query(updateHeaderQuery, [
      Supplier,
      PR_Date,
      Invoice_No,
      total_sum,
      userID,
      PR_Status,
      currentDate,
      Location,
      total_tax,
      PR_Code,
      client_id,
    ]);

    if (headerResult.rowCount === 0) {
      throw new Error("PR Header not found or update failed");
    }

    /* 🔹 Delete old PR transactions */
    await client.query(
      `DELETE FROM pr_tran WHERE "PR_Code" = $1 AND "Client_ID" = $2`,
      [PR_Code, client_id]
    );

    /* 🔹 Prepare UNNEST arrays */
    const pr_codes = [];
    const entry_dates = [];
    const product_ids = [];
    const barcodes = [];
    const ums = [];
    const qtys = [];
    const prices = [];
    const disc_percents = [];
    const disc_amounts = [];
    const totals = [];
    const descriptions = [];
    const tax_amounts = [];
    const tax_groups = [];
    const clients = [];

    product_list.forEach((item) => {
      pr_codes.push(PR_Code);
      entry_dates.push(currentDate);
      product_ids.push(item.Product_ID || "");
      barcodes.push(item.Barcode || "");
      ums.push(item.Product_UM || item.UOM || "");
      qtys.push(Number(item.quantity) || 0);
      prices.push(Number(item.unitPrice) || 0);
      disc_percents.push(Number(item.Discount_Percent) || 0);
      disc_amounts.push(Number(item.Discount_Amount) || 0);
      totals.push(Number(item.Total_Amount) || 0);
      descriptions.push(item.Description || "");
      tax_amounts.push(Number(item.Tax_Amount) || 0);
      tax_groups.push(item.Tax_Group_Code || "");
      clients.push(client_id);
    });

    /* 🔹 Insert PR transactions using UNNEST */
    const insertTranQuery = `
      INSERT INTO pr_tran (
        "PR_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "PR_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","Description","Tax_Amount","Tax_Group_Code","Client_ID"
      )
      SELECT *
      FROM UNNEST(
        $1::varchar[], $2::timestamp[], $3::varchar[], $4::varchar[],
        $5::varchar[], $6::numeric[], $7::numeric[], $8::numeric[],
        $9::numeric[], $10::numeric[], $11::varchar[],
        $12::numeric[], $13::varchar[], $14::varchar[]
      )
    `;

    await client.query(insertTranQuery, [
      pr_codes,
      entry_dates,
      product_ids,
      barcodes,
      ums,
      qtys,
      prices,
      disc_percents,
      disc_amounts,
      totals,
      descriptions,
      tax_amounts,
      tax_groups,
      clients,
    ]);

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Purchase Return updated successfully",
      PR_Code,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction Error:", error);

    return res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
