const db = require("../../config/db"); // pg Pool
const client_id = "940T0003"; // move to .env later

/* =========================
   GET SUPPLIER MASTER
========================= */
exports.getSupplierMaster = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "supplier_master"
       WHERE "Client_ID" = $1`,
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
   GET SUPPLIER MASTER LIST
   (Same data – kept separate
    to match existing frontend)
========================= */
exports.getSupplierMasterList = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "supplier_master"
       WHERE "Client_ID" = $1`,
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
