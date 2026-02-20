const db = require("../../config/db");
const client_id = "940T0003";

exports.recordPayment = async (req, res) => {
  const { paymentsToRecord } = req.body;
  const client_id = "940T0003";

  if (!Array.isArray(paymentsToRecord) || paymentsToRecord.length === 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const item of paymentsToRecord) {
      const { invoice_number, payment_amount } = item;

      if (!invoice_number || !payment_amount || payment_amount <= 0) {
        throw new Error(`Invalid data for invoice ${invoice_number}`);
      }

      // 🔥 Single optimized query
      const result = await client.query(
        `
        UPDATE "invoice_header"
        SET 
          "Paid_Amount" = "Paid_Amount" + $1,
          "INV_Posted" = CASE 
                            WHEN "Paid_Amount" + $1 >= "INV_Amount"
                            THEN 1
                            ELSE "INV_Posted"
                         END
        WHERE "INV_Code" = $2
          AND "Client_ID" = $3
          AND ("Paid_Amount" + $1) <= "INV_Amount"   -- Prevent overpayment
        RETURNING "INV_Code"
        `,
        [payment_amount, invoice_number, client_id],
      );

      if (result.rowCount === 0) {
        throw new Error(
          `Invoice not found or overpayment attempted: ${invoice_number}`,
        );
      }
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Payments processed successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction Error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
};

exports.createRecordPayment = async (req, res) => {
  // routes/recordPayment.js

  try {
    const last = await client.query(
      `SELECT "RV_No"
         FROM "Record_Payment"
         WHERE "CLient_ID" = $1
         ORDER BY "RV_NO" DESC
         LIMIT 1
        `,
      [client_id],
    );

    let newRVNo = "RV0000000001"; // Default for first entry

    if (last.rows.length > 0) {
      const lastRVNo = last.rows[0].RV_No; // e.g., "RV0005"
      const lastNumber = parseInt(lastRVNo.substring(2)); // Extract numeric part (e.g., 5)
      newRVNo = `RV${String(lastNumber + 1).padStart(10, "0")}`;
    }

    const {
      Customer_Name,
      Customer_Code,
      Invoice_No,
      Event_Date,
      Entry_Date,
      Entry_User,
      Invoice_Total,
      Tax_Amount,
      Paid_Amount,
      RV_Date,
      Status,
      Payment_Mode,
      Doc_Ref_No,
      Chq_Date,
      Client_ID,
      Location_ID,
      Payment_Description,
    } = req.body;

    const query = `
      INSERT INTO "Record_Payment" (
        "RV_No",
        "Customer_Name",
        "Customer_Code",
        "Invoice_No",
        "Event_Date",
        "Entry_Date",
        "Entry_User",
        "Invoice_Total",
        "Tax_Amount",
        "Paid_Amount",
        "RV_Date",
        "Status",
        "Payment_Mode",
        "Doc_Ref_No",
        "Chq_Date",
        "Client_ID",
        "Location_ID",
        "Payment_Description"
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *;
    `;

    const values = [
      newRVNo,
      Customer_Name,
      Customer_Code,
      Invoice_No,
      Event_Date,
      Entry_Date,
      Entry_User,
      Invoice_Total,
      Tax_Amount,
      Paid_Amount,
      RV_Date,
      Status,
      Payment_Mode,
      Doc_Ref_No,
      Chq_Date,
      Client_ID,
      Location_ID,
      Payment_Description,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Record Payment inserted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Insert Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to insert record payment",
      error: error.message,
    });
  }

  module.exports = router;
};
