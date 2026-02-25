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

// exports.createRecordPayment = async (req, res) => {
//   // routes/recordPayment.js
//   const { paymentsToRecord } = req.body;
//   console.log("data:", paymentsToRecord);
//   const date = new Date();
//   const user = "01";
//   const client = await db.connect();

//   try {
//     const last = await client.query(
//       `SELECT "RP_No"
//          FROM "record_payment"
//          WHERE "Client_ID" = $1
//          ORDER BY "RP_No" DESC
//          LIMIT 1
//         `,
//       [client_id],
//     );

//     let newRVNo = "RV0000000001"; // Default for first entry

//     if (last.rows.length > 0) {
//       const lastRVNo = last.rows[0].RP_No; // e.g., "RV0005"
//       const lastNumber = parseInt(lastRVNo.substring(2)); // Extract numeric part (e.g., 5)
//       newRVNo = `RV${String(lastNumber + 1).padStart(10, "0")}`;
//     }

//     const {
//       customer_name,
//       customer_code,
//       invoice_number,
//       total_amount,
//       invoice_tax_amount,
//       paid_amount,
//       payment_date,
//       payment_mode,
//       location_id,
//       reference,
//     } = paymentsToRecord;

//     const query = `
//       INSERT INTO "record_payment" (
//         "RP_No",
//         "Customer_Name",
//         "Customer_Code",
//         "Invoice_No",
//         "Event_Date",
//         "Entry_Date",
//         "Entry_User",
//         "Invoice_Total",
//         "Tax_Amount",
//         "Paid_Amount",
//         "RP_Date",
//         "Status",
//         "Payment_Mode",
//         "Chq_Date",
//         "Client_ID",
//         "Location_ID",
//         "Payment_Description"
//       )
//       VALUES (
//         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
//         $11,$12,$13,$14,$15,$16,$17
//       )
//       RETURNING *;
//     `;

//     const values = [
//       newRVNo,
//       customer_name,
//       customer_code,
//       invoice_number,
//       date,
//       date,
//       user,
//       total_amount,
//       invoice_tax_amount,
//       paid_amount,
//       payment_date,
//       0,
//       payment_mode,
//       null, // Chq_Date (null if not applicable)
//       client_id,
//       location_id,
//       reference, // Payment_Description (null if not applicable)
//     ];

//     // const result = await client.query(query, values);

//     // res.status(201).json({
//     //   success: true,
//     //   message: "Record Payment inserted successfully",
//     //   data: result.rows[0],
//     // });
//   } catch (error) {
//     console.error("Insert Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to insert record payment",
//       error: error.message,
//     });
//   }
// };

// exports.createRecordPayment = async (req, res) => {
//   const { paymentsToRecord } = req.body;

//   const date = new Date();
//   const user = "01";
//   const client = await db.connect();

//   try {
//     await client.query("BEGIN");

//     // 🔹 Get Last RP_No
//     const last = await client.query(
//       `SELECT "RP_No"
//        FROM "record_payment"
//        WHERE "Client_ID" = $1
//        ORDER BY "RP_No" DESC
//        LIMIT 1`,
//       [client_id],
//     );

//     let lastNumber = 0;

//     if (last.rows.length > 0) {
//       const lastRPNo = last.rows[0]["RP_No"]; // IMPORTANT FIX
//       lastNumber = parseInt(lastRPNo.substring(2));
//     }

//     const insertedRows = [];

//     for (const payment of paymentsToRecord) {
//       lastNumber++;

//       const newRPNo = `RV${String(lastNumber).padStart(10, "0")}`;

//       const insertQuery = `
//         INSERT INTO "record_payment" (
//           "RP_No",
//           "Customer_Name",
//           "Customer_Code",
//           "Invoice_No",
//           "Event_Date",
//           "Entry_Date",
//           "Entry_User",
//           "Invoice_Total",
//           "Tax_Amount",
//           "Paid_Amount",
//           "RP_Date",
//           "Status",
//           "Payment_Mode",
//           "Chq_Date",
//           "Client_ID",
//           "Location_ID",
//           "Payment_Description"
//         )
//         VALUES (
//           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
//           $11,$12,$13,$14,$15,$16,$17
//         )
//         RETURNING *;
//       `;

//       const values = [
//         newRPNo,
//         payment.customer_name,
//         payment.customer_code,
//         payment.invoice_number,
//         date,
//         date,
//         user,
//         payment.total_amount, // Invoice_Total (if needed fetch separately)
//         payment.invoice_tax_amount, // Tax_Amount
//         payment.payment_amount,
//         payment.payment_date,
//         0,
//         payment.payment_mode,
//         null,
//         client_id,
//         payment.location_id,
//         payment.reference,
//       ];

//       const result = await client.query(insertQuery, values);
//       insertedRows.push(result.rows[0]);
//     }

//     await client.query("COMMIT");

//     res.status(201).json({
//       success: true,
//       message: "Record Payment inserted successfully",
//       data: insertedRows,
//     });
//   } catch (error) {
//     await client.query("ROLLBACK");

//     console.error("Insert Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to insert record payment",
//       error: error.message,
//     });
//   } finally {
//     client.release();
//   }
// };

exports.processRecordPayment = async (req, res) => {
  const {
    paymentsToRecord,
    customer_code,
    customer_name,
    payment_date,
    payment_mode,
  } = req.body;
  const client_id = "940T0003"; // or take from req.body

  if (!Array.isArray(paymentsToRecord) || paymentsToRecord.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid payload",
    });
  }

  const date = new Date();
  const user = "01";
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 🔹 Get last RP number
    const last = await client.query(
      `SELECT "RP_No"
       FROM "record_payment"
       WHERE "Client_ID" = $1
       ORDER BY "RP_No" DESC
       LIMIT 1`,
      [client_id],
    );

    let lastNumber = 0;

    if (last.rows.length > 0) {
      const lastRPNo = last.rows[0]["RP_No"];
      lastNumber = parseInt(lastRPNo.substring(2)) || 0;
    }

    const insertedRows = [];

    for (const payment of paymentsToRecord) {
      const {
        invoice_number,
        payment_amount,
        total_amount,
        invoice_tax_amount,
        paid_amount,
        location_id,
        reference,
      } = payment;

      if (!invoice_number || payment_amount <= 0) {
        throw new Error(`Invalid data for invoice ${invoice_number}`);
      }

      // 🔹 Generate next RP number
      lastNumber++;
      const newRPNo = `RV${String(lastNumber).padStart(10, "0")}`;

      // 🔥 1️⃣ Insert into record_payment
      const insertResult = await client.query(
        `
        INSERT INTO "record_payment" (
          "RP_No",
          "Customer_Name",
          "Customer_Code",
          "Invoice_No",
          "Event_Date",
          "Entry_Date",
          "Entry_User",
          "Invoice_Total",
          "Tax_Amount",
          "Paid_Amount",
          "RP_Date",
          "Status",
          "Payment_Mode",
          "Chq_Date",
          "Client_ID",
          "Location_ID",
          "Payment_Description"
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17
        )
        RETURNING *
        `,
        [
          newRPNo,
          customer_name,
          customer_code,
          invoice_number,
          date,
          date,
          user,
          total_amount,
          invoice_tax_amount,
          payment_amount + paid_amount,
          payment_date,
          0,
          payment_mode,
          null,
          client_id,
          location_id,
          reference,
        ],
      );

      // 🔥 2️⃣ Update invoice_header (Prevent Overpayment)
      const updateResult = await client.query(
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
          AND ("Paid_Amount" + $1) <= "INV_Amount"
        RETURNING "INV_Code"
        `,
        [payment_amount, invoice_number, client_id],
      );

      if (updateResult.rowCount === 0) {
        throw new Error(
          `Invoice not found or overpayment attempted: ${invoice_number}`,
        );
      }

      insertedRows.push(insertResult.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Payment recorded and invoices updated successfully",
      data: insertedRows,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Transaction Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Transaction failed",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
