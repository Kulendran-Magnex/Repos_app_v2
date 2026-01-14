const db = require("../../config/db"); // pg Pool

/* =========================
   GET GRN HEADER LIST
========================= */
exports.getGRNHeader = async (req, res) => {
  const client_id = req.user?.client_id;

  try {
    const result = await db.query(
      `
      SELECT g.*, sm."Supplier_Name"
      FROM "grn_header" g
      JOIN "supplier_master" sm
        ON g."Supplier_Code" = sm."Supplier_Code"
      WHERE g."Client_ID" = $1
      ORDER BY g."Creation_Date" DESC
      `,
      [client_id]
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
   GET GRN HEADER BY ID
========================= */
exports.getGRNHeaderByID = async (req, res) => {
  const client_id = req.user?.client_id;

  try {
    const result = await db.query(
      `
      SELECT *
      FROM "grn_header"
      WHERE "GRN_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
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
   GET GRN BY SUPPLIER
========================= */
exports.getGRNHeaderBySupplier = async (req, res) => {
  const client_id = req.user?.client_id;
  const supplierCode = req.params.supplierCode;

  try {
    const result = await db.query(
      `
      SELECT g.*, sm."Supplier_Name"
      FROM "grn_header" g
      JOIN "supplier_master" sm
        ON g."Supplier_Code" = sm."Supplier_Code"
      WHERE g."Supplier_Code" = $1
        AND g."Client_ID" = $2
        AND g."GRN_Status" <> 'D'
      ORDER BY g."Creation_Date" DESC
      `,
      [supplierCode, client_id]
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
   GET GRN TRAN BY ID
========================= */
exports.getGRNTranByID = async (req, res) => {
  const client_id = req.user?.client_id;

  try {
    const result = await db.query(
      `
      SELECT *
      FROM "grn_tran"
      WHERE "GRN_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
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
   CREATE GRN
========================= */
exports.createGRN = async (req, res) => {
  const { grnHeadertData, product_list, total_tax, total_sum } = req.body;
  const client_id = req.user?.client_id;
  const userID = "01";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    GRN_Date,
    Location,
    Supplier,
    Invoice_No,
    Invoice_Date,
    GRN_Type,
    Credit_Period,
    Payment_Due,
  } = grnHeadertData;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ---------- Generate GRN Code ---------- */
    const last = await client.query(
      `
      SELECT "GRN_Code"
      FROM "grn_header"
      WHERE "Client_ID" = $1
      ORDER BY "GRN_Code" DESC
      LIMIT 1
      `,
      [client_id]
    );

    let GRN_Code = "GRN0000000001";
    if (last.rowCount > 0) {
      const num = parseInt(last.rows[0].GRN_Code.substring(3)) + 1;
      GRN_Code = `GRN${num.toString().padStart(10, "0")}`;
    }

    /* ---------- Insert Header ---------- */
    await client.query(
      `
      INSERT INTO "grn_header" (
        "GRN_Code","Supplier_Code","GRN_Date","Invoice_No",
        "GRN_Tax_Amount","GRN_Amount","Invoice_Date",
        "UserID","GRN_Status","Client_ID","Location_ID",
        "Credit_Period","Payment_Due_Date","GRN_Type"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,'O',$9,$10,$11,$12,$13
      )
      `,
      [
        GRN_Code,
        Supplier,
        GRN_Date,
        Invoice_No,
        total_tax,
        total_sum,
        Invoice_Date,
        userID,
        client_id,
        Location,
        Credit_Period,
        Payment_Due,
        GRN_Type,
      ]
    );

    /* ---------- Prepare UNNEST Arrays ---------- */
    const rows = product_list.map((item) => {
      const p = item.grnData || {};
      return [
        GRN_Code,
        new Date(),
        p.Product_ID,
        p.Barcode,
        p.UOM,
        item.quantity,
        item.unitPrice,
        item.discountRate,
        item.discountAmount,
        item.total,
        userID,
        client_id,
        Location,
        0,
        item.taxAmount,
        item.TaxGroup,
        p.Description,
        p.FOC,
        p.Retail_Price,
        p.MRP,
        p.Exp_Date,
      ];
    });

    const columns = rows[0].map((_, i) => rows.map((r) => r[i]));

    /* ---------- Bulk Insert using UNNEST ---------- */
    await client.query(
      `
      INSERT INTO "grn_tran" (
        "GRN_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "GRN_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","UserID","Client_ID","Location_ID",
        "Tax_Rate","Tax_Amount","Tax_Group_Code","Description",
        "FOC","Retail_Price","MRP","Exp_Date"
      )
      SELECT *
      FROM UNNEST (
        $1::text[], $2::timestamp[], $3::text[], $4::text[], $5::text[],
        $6::numeric[], $7::numeric[], $8::numeric[], $9::numeric[],
        $10::numeric[], $11::text[], $12::text[], $13::text[],
        $14::numeric[], $15::numeric[], $16::text[], $17::text[],
        $18::numeric[], $19::numeric[], $20::numeric[], $21::date[]
      )
      `,
      columns
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "GRN created successfully",
      GRN_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};

exports.updateGRN = async (req, res) => {
  const GRN_Code = req.params.id;
  const { grnHeaderData, product_list, total_tax, total_sum } = req.body;
  const client_id = req.user?.client_id;
  const userID = "01";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    GRN_Date,
    Location,
    Supplier,
    Invoice_No,
    Invoice_Date,
    GRN_Type,
    Credit_Period,
    Payment_Due,
    TaxGroup,
  } = grnHeaderData;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ---------- Update Header ---------- */
    await client.query(
      `
      UPDATE "grn_header"
      SET
        "Supplier_Code" = $1,
        "GRN_Date" = $2,
        "Invoice_No" = $3,
        "GRN_Tax_Amount" = $4,
        "GRN_Amount" = $5,
        "Invoice_Date" = $6,
        "Location_ID" = $7,
        "Credit_Period" = $8,
        "Payment_Due_Date" = $9,
        "GRN_Type" = $10,
        "Edited_User" = $11,
        "Edited_Date" = NOW()
      WHERE "GRN_Code" = $12 AND "Client_ID" = $13
      `,
      [
        Supplier,
        GRN_Date,
        Invoice_No,
        total_tax,
        total_sum,
        Invoice_Date,
        Location,
        Credit_Period === "" || Credit_Period == null
          ? 0
          : Number(Credit_Period),
        Payment_Due,
        GRN_Type,
        userID,
        GRN_Code,
        client_id,
      ]
    );

    /* ---------- Delete old lines ---------- */
    await client.query(
      `DELETE FROM "grn_tran" WHERE "GRN_Code" = $1 AND "Client_ID" = $2`,
      [GRN_Code, client_id]
    );

    /* ---------- Prepare UNNEST Arrays ---------- */
    const rows = product_list.map((item) => [
      GRN_Code,
      new Date(),
      item.Product_ID,
      item.Barcode,
      item.Product_UM,
      item.quantity,
      item.unitPrice,
      item.Discount_Percent ?? 0,
      item.Discount_Amount,
      item.Total_Amount,
      userID,
      client_id,
      Location,
      item.Tax_Rate ?? 0,
      item.Tax_Amount,
      TaxGroup,
      item.Description,
      item.FOC,
      item.Retail_Price,
      item.MRP,
      item.Exp_Date,
    ]);

    const columns = rows[0].map((_, i) => rows.map((r) => r[i]));

    /* ---------- Bulk Insert ---------- */
    await client.query(
      `
      INSERT INTO "grn_tran" (
        "GRN_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "GRN_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","UserID","Client_ID","Location_ID",
        "Tax_Rate","Tax_Amount","Tax_Group_Code","Description",
        "FOC","Retail_Price","MRP","Exp_Date"
      )
      SELECT *
      FROM UNNEST (
        $1::text[], $2::timestamp[], $3::text[], $4::text[], $5::text[],
        $6::numeric[], $7::numeric[], $8::numeric[], $9::numeric[],
        $10::numeric[], $11::text[], $12::text[], $13::text[],
        $14::numeric[], $15::numeric[], $16::text[], $17::text[],
        $18::numeric[], $19::numeric[], $20::numeric[], $21::date[]
      )
      `,
      columns
    );

    await client.query("COMMIT");

    res.json({ message: "GRN updated successfully", GRN_Code });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};
