const db = require("../../config/db"); // pg Pool
const client_id = "940T0003";

/* =========================
   TAX MASTER
========================= */
exports.getTaxMaster = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT "Tax_Code","Tax_Name","Tax_Rate","Formula"
       FROM "tax_mast"
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

exports.createTaxMaster = async (req, res) => {
  const { taxName, taxRate, formula } = req.body;

  try {
    const last = await db.query(
      `SELECT "Tax_Code"
       FROM "tax_mast"
       WHERE "Client_id" = $1
       ORDER BY "Tax_Code" DESC
       LIMIT 1`,
      [client_id]
    );

    let nextId = "T01";
    if (last.rowCount > 0) {
      const lastNum = parseInt(last.rows[0].Tax_Code.substring(1), 10);
      nextId = `T${String(lastNum + 1).padStart(2, "0")}`;
    }

    const result = await db.query(
      `INSERT INTO "tax_mast"
       ("Tax_Code","Tax_Name","Tax_Rate","Formula","Client_id")
       VALUES ($1,$2,$3,$4,$5)`,
      [nextId, taxName, taxRate, formula, client_id]
    );

    res.status(201).json({ message: "Tax master added", taxCode: nextId });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.updateTaxMaster = async (req, res) => {
  const { taxName, taxRate, formula } = req.body;

  try {
    const result = await db.query(
      `UPDATE "tax_mast"
       SET "Tax_Name"=$1,"Tax_Rate"=$2,"Formula"=$3
       WHERE "Tax_Code"=$4 AND "Client_id"=$5`,
      [taxName, taxRate, formula, req.params.id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tax not found" });
    }

    res.json({ message: "Tax Master Updated" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.deleteTaxMaster = async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM "tax_mast"
       WHERE "Tax_Code"=$1 AND "Client_id"=$2`,
      [req.params.id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tax not found" });
    }

    res.json({ message: "Tax Master Deleted" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   TAX GROUP
========================= */
exports.getTaxGroup = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT tg."Tax_Group_Code", tg."Tax_Group_Name",
              tm."Tax_Name", tm."Tax_Code"
       FROM "tax_group" tg
       JOIN "tax_mast" tm
         ON tg."Tax_Code" = tm."Tax_Code"
        AND tg."Client_id" = tm."Client_id"
       WHERE tg."Client_id" = $1
       ORDER BY tg."Tax_Group_Code"`,
      [client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data Not Found" });
    }

    const groups = {};
    result.rows.forEach((r) => {
      if (!groups[r.Tax_Group_Code]) {
        groups[r.Tax_Group_Code] = {
          taxGroupName: r.Tax_Group_Name,
          taxNames: [],
          taxCodes: [],
        };
      }
      groups[r.Tax_Group_Code].taxNames.push(r.Tax_Name);
      groups[r.Tax_Group_Code].taxCodes.push(r.Tax_Code);
    });

    res.json(
      Object.entries(groups).map(([code, g]) => ({
        taxGroupCode: code,
        taxGroupName: g.taxGroupName,
        taxNames: g.taxNames.join(", "),
        taxCodes: g.taxCodes.join(", "),
      }))
    );
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database Error" });
  }
};

exports.createTaxGroup = async (req, res) => {
  const { taxCodes, taxGroupName } = req.body;

  try {
    const last = await db.query(
      `SELECT "Tax_Group_Code"
       FROM "tax_group"
       WHERE "Client_id"=$1
       ORDER BY "Tax_Group_Code" DESC
       LIMIT 1`,
      [client_id]
    );

    let nextID = "TG01";
    if (last.rowCount > 0) {
      const num = parseInt(last.rows[0].Tax_Group_Code.substring(2), 10);
      nextID = `TG${String(num + 1).padStart(2, "0")}`;
    }

    const insert = `INSERT INTO "tax_group"
       ("Tax_Code","Tax_Group_Code","Tax_Group_Name","Client_id")
       VALUES ($1,$2,$3,$4)`;

    await Promise.all(
      taxCodes.map((code) =>
        db.query(insert, [code, nextID, taxGroupName, client_id])
      )
    );

    res.json({ message: "Tax Group Created", taxGroupCode: nextID });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.updateTaxGroup = async (req, res) => {
  const { taxGroupCode } = req.params;
  const { taxCodes, taxGroupName } = req.body;

  try {
    await db.query(
      `DELETE FROM "tax_group"
       WHERE "Tax_Group_Code"=$1 AND "Client_id"=$2`,
      [taxGroupCode, client_id]
    );

    const insert = `INSERT INTO "tax_group"
       ("Tax_Code","Tax_Group_Code","Tax_Group_Name","Client_id")
       VALUES ($1,$2,$3,$4)`;

    await Promise.all(
      taxCodes.map((code) =>
        db.query(insert, [code, taxGroupCode, taxGroupName, client_id])
      )
    );

    res.json({ message: "Tax group updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.deleteTaxGroup = async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM "tax_group"
       WHERE "Tax_Group_Code"=$1 AND "Client_id"=$2`,
      [req.params.id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tax Group Not Found" });
    }

    res.json({ message: "Tax Group Deleted" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database Error" });
  }
};

exports.getTaxFormula = async (req, res) => {
  const { taxGroupCode } = req.body;

  try {
    const result = await db.query(
      `SELECT tm."Tax_Name", tm."Formula"
       FROM "tax_group" tg
       JOIN "tax_mast" tm
         ON tg."Tax_Code" = tm."Tax_Code"
        AND tg."Client_id" = tm."Client_id"
       WHERE tg."Tax_Group_Code"=$1
         AND tg."Client_id"=$2`,
      [taxGroupCode, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data Not Found" });
    }

    res.json({ formulas: result.rows });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database Error" });
  }
};
