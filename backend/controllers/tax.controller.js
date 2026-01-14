const db = require("../config/db");

exports.calculateTax = async (req, res) => {
  const { taxGroupCode } = req.body;
  const client_id = "940T0003";

  try {
    const result = await db.query(
      `
      SELECT tm."Tax_Name", tm."Formula"
      FROM "tax_group" tg
      JOIN "tax_mast" tm
        ON tg."Tax_Code" = tm."Tax_Code"
       AND tg."Client_id" = tm."Client_id"
      WHERE tg."Tax_Group_Code" = $1
        AND tg."Client_id" = $2
      `,
      [taxGroupCode, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No tax formulas found" });
    }

    res.json({ formulas: result.rows });
  } catch (err) {
    console.error("Calculate tax error:", err);
    return res.status(500).json({ message: "Error occurred" });
  }
};
