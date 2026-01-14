const db = require("../../config/db"); // pg Pool
const client_id = "940T0003";

/* =========================
   GET CURRENCY MASTER
========================= */
exports.getCurrencyMaster = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT "Currency_Code",
              "Currency_Rate",
              "Currency_Name"
       FROM "currency_mast"
       WHERE "Client_id" = $1`,
      [client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   CREATE CURRENCY MASTER
========================= */
exports.createCurrencyMaster = async (req, res) => {
  const { currencyName, currencyRate } = req.body;

  try {
    // Get last Currency_Code
    const result = await db.query(
      `SELECT "Currency_Code"
       FROM "currency_mast"
       WHERE "Client_id" = $1
       ORDER BY "Currency_Code" DESC
       LIMIT 1`,
      [client_id]
    );

    let nextId = "CU01";

    if (result.rowCount > 0) {
      const lastId = result.rows[0].Currency_Code;
      const lastNumber = parseInt(lastId.substring(2), 10) || 0;
      const nextNumber = lastNumber + 1;
      nextId = `CU${nextNumber.toString().padStart(2, "0")}`;
    }

    const insertResult = await db.query(
      `INSERT INTO "currency_mast"
        ("Currency_Code", "Currency_Rate", "Currency_Name", "Client_id")
       VALUES ($1, $2, $3, $4)`,
      [nextId, currencyRate, currencyName, client_id]
    );

    if (insertResult.rowCount === 0) {
      return res.status(500).json({ message: "Currency insert failed" });
    }

    res.status(201).json({
      message: "Currency Inserted",
      Currency_Code: nextId,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   UPDATE CURRENCY MASTER
========================= */
exports.updateCurrencyMaster = async (req, res) => {
  const { currencyName, currencyRate } = req.body;
  const currencyCode = req.params.id;

  try {
    const result = await db.query(
      `UPDATE "currency_mast"
       SET "Currency_Rate" = $1,
           "Currency_Name" = $2
       WHERE "Currency_Code" = $3
         AND "Client_id" = $4`,
      [currencyRate, currencyName, currencyCode, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Currency not found" });
    }

    res.json({ message: "Currency Master Updated" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   DELETE CURRENCY MASTER
========================= */
exports.deleteCurrencyMaster = async (req, res) => {
  const currencyCode = req.params.id;

  try {
    const result = await db.query(
      `DELETE FROM "currency_mast"
       WHERE "Currency_Code" = $1
         AND "Client_id" = $2`,
      [currencyCode, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Currency not found" });
    }

    res.json({ message: "Currency Master deleted successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};
