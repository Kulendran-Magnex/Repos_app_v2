const db = require("../../config/db"); // pg Pool
const client_id = "940T0003"; // move to .env later

/* =========================
   GET PACKING MASTER
========================= */
exports.getPackingMaster = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "packing_master"
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
   CREATE PACKING MASTER
========================= */
exports.createPackingMaster = async (req, res) => {
  const { pack_id, pack_description } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO "packing_master"
       ("Pack_ID", "Pack_description", "Client_id")
       VALUES ($1, $2, $3)`,
      [pack_id, pack_description, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(500).json({ message: "Error adding packing master" });
    }

    res.status(201).json({
      message: "Packing master added successfully",
    });
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   UPDATE PACKING MASTER
========================= */
exports.updatePackingMaster = async (req, res) => {
  const { pack_description } = req.body;
  const packId = req.params.id;

  try {
    const result = await db.query(
      `UPDATE "packing_master"
       SET "Pack_description" = $1
       WHERE "Pack_ID" = $2
         AND "Client_id" = $3`,
      [pack_description, packId, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Packing Master Not Found" });
    }

    res.json({ message: "Packing master updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   DELETE PACKING MASTER
========================= */
exports.deletePackingMaster = async (req, res) => {
  const packId = req.params.id;

  try {
    const result = await db.query(
      `DELETE FROM "packing_master"
       WHERE "Pack_ID" = $1
         AND "Client_id" = $2`,
      [packId, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Packing Master Not Found" });
    }

    res.json({ message: "Packing Master Deleted" });
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
