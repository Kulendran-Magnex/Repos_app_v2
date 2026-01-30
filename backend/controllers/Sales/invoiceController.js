const db = require("../../config/db");
const client_id = "940T0003";

exports.createInvoice = async (req, res) => {
  const { headerData, product_list, total_tax, total_sum } = req.body;
  const client_id = req.user?.client_id;
  const userID = "01";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    Customer_Code,
    INV_Date,
    PO_No,
    INV_Tax_Amount,
    INV_Additional_Charges,
    INV_Other_Charges,
    INV_Amount,
    PO_Date,
    UserID,
    Location_ID,
    INV_Status,
    Client_ID,
  } = headerData;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ---------- Generate GRN Code ---------- */
    const last = await client.query(
      `
      SELECT "INV_Code"
      FROM "invoice_header"
      WHERE "Client_ID" = $1
      ORDER BY "INV_Code" DESC
      LIMIT 1
      `,
      [client_id],
    );

    let INV_Code = "INV0000000001";
    if (last.rowCount > 0) {
      const num = parseInt(last.rows[0].INV_Code.substring(3)) + 1;
      INV_Code = `INV${num.toString().padStart(10, "0")}`;
    }

    /* ---------- Insert Header ---------- */
    await client.query(
      `
      INSERT INTO "invoice_header" (
        "INV_Code","Customer_Code","INV_Date","PO_No",
        "INV_Tax_Amount","INV_Additional_Charges","INV_Other_Charges",
        "INV_Amount","PO_Date","UserID","Location_ID",
        "INV_Status","Client_ID"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
      )
      `,
      [
        INV_Code,
        Customer_Code,
        INV_Date,
        PO_No,
        INV_Tax_Amount,
        INV_Additional_Charges,
        INV_Other_Charges,
        INV_Amount,
        PO_Date,
        UserID,
        Location_ID,
        INV_Status,
        Client_ID,
      ],
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
      ];
    });

    const columns = rows[0].map((_, i) => rows.map((r) => r[i]));

    /* ---------- Bulk Insert using UNNEST ---------- */
    await client.query(
      `
      INSERT INTO "invoice_tran" (
        "INV_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "INV_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","UserID","Client_ID","Location_ID",
        "Tax_Rate","Tax_Amount","Tax_Group_Code","Description"
      )
      SELECT *
      FROM UNNEST (
        $1::text[], $2::timestamp[], $3::text[], $4::text[], $5::text[],
        $6::numeric[], $7::numeric[], $8::numeric[], $9::numeric[],
        $10::numeric[], $11::text[], $12::text[], $13::text[],
        $14::numeric[], $15::numeric[], $16::text[], $17::text[]
      )
      `,
      columns,
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Invoice created successfully",
      INV_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};
