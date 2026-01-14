const db = require("../../config/db"); // pg Pool
const client_id = "940T0003"; // move to .env later

// ============================
// GET BRAND MASTER
// ============================
exports.getBrandMaster = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "brand_master"
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

// ============================
// CREATE BRAND MASTER
// ============================
exports.createBrandMaster = async (req, res) => {
  const { brandCode, brandName } = req.body;

  const query = `
    INSERT INTO "brand_master"
      ("Brand_Code", "Brand_Name", "Client_id")
    VALUES ($1, $2, $3)
  `;

  try {
    const result = await db.query(query, [brandCode, brandName, client_id]);

    if (result.rowCount === 0) {
      return res.status(500).json({ message: "Error adding brand master" });
    }

    res.status(201).json({
      message: "Brand master added successfully",
    });
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// ============================
// UPDATE BRAND MASTER
// ============================
exports.updateBrandMaster = async (req, res) => {
  const { brandName } = req.body;
  const { id } = req.params;

  const query = `
    UPDATE "brand_master"
    SET "Brand_Name" = $1
    WHERE "Brand_Code" = $2
      AND "Client_id" = $3
  `;

  try {
    const result = await db.query(query, [brandName, id, client_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.json({ message: "Brand Master Updated" });
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// ============================
// DELETE BRAND MASTER
// ============================
exports.deleteBrandMaster = async (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM "brand_master"
    WHERE "Brand_Code" = $1
      AND "Client_id" = $2
  `;

  try {
    const result = await db.query(query, [id, client_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.json({ message: "Brand Master Deleted" });
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
