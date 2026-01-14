const db = require("../../config/db");
const client_id = "940T0003";

/* =========================
   GET CATEGORY LEVEL 1
========================= */
exports.getCategorylvl1 = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM categorylvl1
       WHERE Client_id = $1`,
      [client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data Not Found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Error occurred" });
  }
};

/* =========================
   GET CATEGORY LEVEL 2
========================= */
exports.getCategorylvl2 = async (req, res) => {
  const { categoryLvl1Id } = req.params;

  try {
    const result = await db.query(
      `SELECT *
       FROM categorylvl2
       WHERE categorylvl1_id = $1
         AND Client_id = $2`,
      [categoryLvl1Id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data Not Found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Error occurred" });
  }
};

/* =========================
   GET CATEGORY LEVEL 3
========================= */
exports.getCategorylvl3 = async (req, res) => {
  const { categoryLvl2Id } = req.params;

  try {
    const result = await db.query(
      `SELECT *
       FROM categorylvl3
       WHERE category_lvl2_id = $1
         AND Client_id = $2`,
      [categoryLvl2Id, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data Not Found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Error occurred" });
  }
};

/* =========================
   CREATE CATEGORY LEVEL 1
========================= */
exports.createCategorylvl1 = async (req, res) => {
  const { name } = req.body;

  try {
    const result = await db.query(
      `SELECT id
       FROM categorylvl1
       WHERE Client_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [client_id]
    );

    let nextId = "C01";

    if (result.rowCount > 0) {
      const lastId = result.rows[0].id;
      const nextNumber = parseInt(lastId.substring(1), 10) + 1;
      nextId = `C${nextNumber.toString().padStart(2, "0")}`;
    }

    const insertResult = await db.query(
      `INSERT INTO categorylvl1 (id, name, Client_id)
       VALUES ($1, $2, $3)`,
      [nextId, name, client_id]
    );

    if (insertResult.rowCount === 0) {
      return res.status(500).json({ message: "Insert failed" });
    }

    res.status(201).json({
      message: "categorylvl1 master added successfully",
      id: nextId,
      name,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   CREATE CATEGORY LEVEL 2
========================= */
exports.createCategorylvl2 = async (req, res) => {
  const { name, categoryLvl1Id } = req.body;

  try {
    const result = await db.query(
      `SELECT id
       FROM categorylvl2
       WHERE categorylvl1_id = $1
         AND Client_id = $2
       ORDER BY id DESC
       LIMIT 1`,
      [categoryLvl1Id, client_id]
    );

    let nextId = `${categoryLvl1Id}01`;

    if (result.rowCount > 0) {
      const lastId = result.rows[0].id;
      const nextNumber = parseInt(lastId.substring(1), 10) + 1;
      nextId = `C${nextNumber.toString().padStart(2, "0")}`;
    }

    const insertResult = await db.query(
      `INSERT INTO categorylvl2 (id, name, categorylvl1_id, Client_id)
       VALUES ($1, $2, $3, $4)`,
      [nextId, name, categoryLvl1Id, client_id]
    );

    res.status(201).json({
      message: "categorylvl2 master added successfully",
      id: nextId,
      name,
      categoryLvl1Id,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   CREATE CATEGORY LEVEL 3
========================= */
exports.createCategorylvl3 = async (req, res) => {
  const { name, categoryLvl2Id } = req.body;

  try {
    const result = await db.query(
      `SELECT id
       FROM categorylvl3
       WHERE category_lvl2_id = $1
         AND Client_id = $2
       ORDER BY id DESC
       LIMIT 1`,
      [categoryLvl2Id, client_id]
    );

    let nextId = `${categoryLvl2Id}01`;

    if (result.rowCount > 0) {
      const lastId = result.rows[0].id;
      const nextNumber = parseInt(lastId.substring(1), 10) + 1;
      nextId = `C${nextNumber.toString().padStart(2, "0")}`;
    }

    await db.query(
      `INSERT INTO categorylvl3 (id, name, category_lvl2_id, Client_id)
       VALUES ($1, $2, $3, $4)`,
      [nextId, name, categoryLvl2Id, client_id]
    );

    res.status(201).json({
      message: "categorylvl3 master added successfully",
      id: nextId,
      name,
      categoryLvl2Id,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   UPDATE CATEGORY LEVELS
========================= */
exports.updateCategorylvl1 = async (req, res) => {
  const { name } = req.body;

  const result = await db.query(
    `UPDATE categorylvl1
     SET name = $1
     WHERE id = $2 AND Client_id = $3`,
    [name, req.params.id, client_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Categorylvl1 not found" });
  }

  res.json({ message: "Categorylvl1 Updated" });
};

exports.updateCategorylvl2 = async (req, res) => {
  const { name, categorylvl1_id } = req.body;

  const result = await db.query(
    `UPDATE categorylvl2
     SET name = $1, categorylvl1_id = $2
     WHERE id = $3 AND Client_id = $4`,
    [name, categorylvl1_id, req.params.id, client_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Categorylvl2 not found" });
  }

  res.json({ message: "Categorylvl2 Updated" });
};

exports.updateCategorylvl3 = async (req, res) => {
  const { name, categorylvl2_id } = req.body;

  const result = await db.query(
    `UPDATE categorylvl3
     SET name = $1, category_lvl2_id = $2
     WHERE id = $3 AND Client_id = $4`,
    [name, categorylvl2_id, req.params.id, client_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Categorylvl3 not found" });
  }

  res.json({ message: "Categorylvl3 Updated" });
};

/* =========================
   DELETE CATEGORY LEVELS
========================= */
exports.deleteCategorylvl1 = async (req, res) => {
  const result = await db.query(
    `DELETE FROM categorylvl1
     WHERE id = $1 AND Client_id = $2`,
    [req.params.id, client_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Categorylvl1 Not Found" });
  }

  res.json({ message: "Categorylvl1 Deleted" });
};

exports.deleteCategorylvl2 = async (req, res) => {
  const result = await db.query(
    `DELETE FROM categorylvl2
     WHERE id = $1 AND Client_id = $2`,
    [req.params.id, client_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Categorylvl2 Not Found" });
  }

  res.json({ message: "Categorylvl2 Deleted" });
};
