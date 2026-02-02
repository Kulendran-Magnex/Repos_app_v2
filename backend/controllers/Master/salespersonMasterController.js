const db = require("../../config/db");

/* ===============================
   CREATE SALESPERSON
================================ */
exports.createSalesperson = async (req, res) => {
  const { Salesperson_Name, Email, Location_ID } = req.body;
  const Client_ID = "940T0003";

  if (!Salesperson_Name || !Location_ID) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO public.salesperson_master
      ("Salesperson_Name","Email","Client_ID","Location_ID")
      VALUES ($1,$2,$3,$4)
      RETURNING "Salesperson_ID"
      `,
      [Salesperson_Name, Email || null, Client_ID, Location_ID],
    );

    res.status(201).json({
      message: "Salesperson created successfully",
      Salesperson_ID: result.rows[0].Salesperson_ID,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Salesperson already exists (email or name duplicate)",
      });
    }

    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* ===============================
   UPDATE SALESPERSON
================================ */
exports.updateSalesperson = async (req, res) => {
  const { id } = req.params;
  const { Salesperson_Name, Email, Location_ID, Is_Active } = req.body;
  const Client_ID = "940T0003";

  try {
    const result = await db.query(
      `
      UPDATE public.salesperson_master
      SET
        "Salesperson_Name" = $1,
        "Email" = $2,
        "Location_ID" = $3,
        "Is_Active" = $4
      WHERE "Salesperson_ID" = $5
        AND "Client_ID" = $6
      `,
      [Salesperson_Name, Email || null, Location_ID, Is_Active, id, Client_ID],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Salesperson not found" });
    }

    res.json({ message: "Salesperson updated successfully" });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Duplicate email for this client/location",
      });
    }

    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* ===============================
   LIST SALESPERSONS
================================ */
exports.getSalespersons = async (req, res) => {
  const { location_id } = req.query;
  const Client_ID = "940T0003";

  try {
    const result = await db.query(
      `
      SELECT
        "Salesperson_ID",
        "Salesperson_Name",
        "Email",
        "Location_ID",
        "Is_Active"
      FROM public.salesperson_master
      WHERE "Client_ID" = $1
        AND ($2::text IS NULL OR "Location_ID" = $2)
      ORDER BY "Salesperson_Name"
      `,
      [Client_ID, location_id || null],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* ===============================
   ACTIVATE / DEACTIVATE
================================ */
exports.toggleSalesperson = async (req, res) => {
  const { id } = req.params;
  const Client_ID = "940T0003";

  try {
    const result = await db.query(
      `
      UPDATE public.salesperson_master
      SET "Is_Active" = NOT "Is_Active"
      WHERE "Salesperson_ID" = $1
        AND "Client_ID" = $2
      `,
      [id, Client_ID],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Salesperson not found" });
    }

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

/* ===============================
   DELETE (OPTIONAL)
================================ */
exports.deleteSalesperson = async (req, res) => {
  const { id } = req.params;
  const Client_ID = "940T0003";

  try {
    const result = await db.query(
      `
      DELETE FROM public.salesperson_master
      WHERE "Salesperson_ID" = $1
        AND "Client_ID" = $2
      `,
      [id, Client_ID],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Salesperson not found" });
    }

    res.json({ message: "Salesperson deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};
