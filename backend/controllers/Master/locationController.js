const db = require("../../config/db"); // pg Pool
const client_id = "940T0003"; // move to .env later

/* =========================
   GET LOCATION GROUP SETUP
========================= */
exports.getLocation = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "location_group_setup"
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
   GET LOCATION INFO
========================= */
exports.getLocationInfo = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "location_info"
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
