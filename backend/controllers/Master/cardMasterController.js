const db = require("../../config/db"); // pg Pool
const client_id = "940T0003"; // move to .env later

// ============================
// GET CREDIT CARD MASTER
// ============================
exports.getCardMaster = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM "creditcard_mast"
       WHERE "Client_id" = $1`,
      [client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data Not Found!" });
    }

    return res.json(result.rows);
  } catch (error) {
    console.error("DB Error:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

// ============================
// CREATE CREDIT CARD MASTER
// ============================
exports.createCardMaster = async (req, res) => {
  const { ccName } = req.body;

  try {
    // Get last CC_Code
    const codeResult = await db.query(
      `SELECT "CC_Code"
       FROM "creditcard_mast"
       WHERE "Client_id" = $1
       ORDER BY "CC_Code" DESC
       LIMIT 1`,
      [client_id]
    );

    let nextId = "CC01";

    if (codeResult.rowCount > 0) {
      const lastId = codeResult.rows[0].CC_Code;
      const lastNumber = parseInt(lastId.substring(2), 10) || 0;
      const nextNumber = lastNumber + 1;
      nextId = `CC${nextNumber.toString().padStart(2, "0")}`;
    }

    const insertResult = await db.query(
      `INSERT INTO "creditcard_mast"
        ("CC_Code", "CC_Name", "Client_id")
       VALUES ($1, $2, $3)`,
      [nextId, ccName, client_id]
    );

    if (insertResult.rowCount === 0) {
      return res
        .status(500)
        .json({ message: "Error adding credit card master" });
    }

    res.status(201).json({
      message: "Credit Card master added successfully",
      CC_Code: nextId,
    });
  } catch (error) {
    console.error("DB Error:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

// ============================
// UPDATE CREDIT CARD MASTER
// ============================
exports.updateCardMaster = async (req, res) => {
  const { ccName } = req.body;
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE "creditcard_mast"
       SET "CC_Name" = $1
       WHERE "CC_Code" = $2
         AND "Client_id" = $3`,
      [ccName, id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Credit Card Not Found" });
    }

    res.json({ message: "Credit Card Master Updated" });
  } catch (error) {
    console.error("DB Error:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

// ============================
// DELETE CREDIT CARD MASTER
// ============================
exports.deleteCardMaster = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM "creditcard_mast"
       WHERE "CC_Code" = $1
         AND "Client_id" = $2`,
      [id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Credit Card Not Found" });
    }

    res.json({ message: "Credit Card Master Deleted" });
  } catch (error) {
    console.error("DB Error:", error);
    return res.status(500).json({ message: "Database error" });
  }
};
