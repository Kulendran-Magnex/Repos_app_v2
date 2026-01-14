const db = require("../../config/db");
const client_id = "940T0003";

/* =========================
   GET MR HEADER
========================= */
exports.getMRHeader = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM mr_header
      WHERE "Client_ID" = $1
        AND "MR_Status" = 'O'
      ORDER BY "Creation_Date" DESC
      `,
      [client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET MR HEADER BY ID
========================= */
exports.getMRHeaderByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM mr_header
      WHERE "MR_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET MR TRAN WITH UNIT COST
========================= */
exports.getMRTranWithUPrice = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT m.*, pd."Unit_Cost"
      FROM mr_tran m
      JOIN product_details pd
        ON m."Barcode" = pd."Barcode"
      WHERE m."MR_Code" = $1
        AND m."Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   GET MR TRAN BY ID
========================= */
exports.getMRTranByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM mr_tran
      WHERE "MR_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/* =========================
   CREATE MR (WITH UNNEST)
========================= */
exports.createMR = async (req, res) => {
  const { mrData, productList } = req.body;
  const { EntryDate, RequiredDate, Location, Supplier, MR_Status } = mrData;
  const userID = "01";

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ---- Generate MR Code ---- */
    const { rows } = await client.query(
      `
      SELECT "MR_Code"
      FROM mr_header
      WHERE "Client_ID" = $1
      ORDER BY "MR_Code" DESC
      LIMIT 1
      `,
      [client_id]
    );

    let nextId = "MR0000000001";
    if (rows.length) {
      const n = parseInt(rows[0].MR_Code.substring(2)) + 1;
      nextId = `MR${String(n).padStart(10, "0")}`;
    }

    /* ---- Insert Header ---- */
    await client.query(
      `
      INSERT INTO mr_header
      ("MR_Code","MR_Date","Supplier_Code","Required_Date",
       "Creation_Date","MR_Status","UserID","Client_ID","Location_ID")
      VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7,$8)
      `,
      [
        nextId,
        EntryDate,
        Supplier,
        RequiredDate,
        MR_Status,
        userID,
        client_id,
        Location,
      ]
    );

    /* ---- Prepare UNNEST arrays ---- */
    const mr_codes = [];
    const entry_dates = [];
    const required_dates = [];
    const product_ids = [];
    const barcodes = [];
    const descriptions = [];
    const uoms = [];
    const qtys = [];
    const users = [];
    const clients = [];
    const locations = [];

    productList.forEach((p) => {
      mr_codes.push(nextId);
      entry_dates.push(EntryDate);
      required_dates.push(RequiredDate);
      product_ids.push(p.Product_ID);
      barcodes.push(p.Barcode);
      descriptions.push(p.Description);
      uoms.push(p.Stock_UM);
      qtys.push(+p.quantity);
      users.push(userID);
      clients.push(client_id);
      locations.push(Location);
    });

    /* ---- Bulk insert MR Tran ---- */
    await client.query(
      `
      INSERT INTO mr_tran
      ("MR_Code","Entry_Date","Required_Date","Product_ID","Barcode",
       "Description","Product_UM","MR_Qty","UserID","Client_ID","Location_ID")
      SELECT *
      FROM UNNEST(
        $1::varchar[], $2::date[], $3::date[], $4::varchar[],
        $5::varchar[], $6::varchar[], $7::varchar[],
        $8::numeric[], $9::varchar[], $10::varchar[], $11::varchar[]
      )
      `,
      [
        mr_codes,
        entry_dates,
        required_dates,
        product_ids,
        barcodes,
        descriptions,
        uoms,
        qtys,
        users,
        clients,
        locations,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Material Request added successfully",
      MR_Code: nextId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};

/* =========================
   UPDATE MR
========================= */
exports.updateMR = async (req, res) => {
  const { MR_Code } = req.params;
  const { mrHeaderData, productList } = req.body;

  const {
    MR_Date,
    Supplier_Code,
    Required_Date,
    MR_Status,
    Location_ID,
    Edited_User,
  } = mrHeaderData;

  const userID = Edited_User || "01";
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ---- Update MR Header ---- */
    const updateHeaderQuery = `
      UPDATE mr_header
      SET
        "MR_Date" = $1,
        "Supplier_Code" = $2,
        "Required_Date" = $3,
        "MR_Status" = $4,
        "Location_ID" = $5,
        "Edited_User" = $6,
        "Edited_Date" = NOW()
      WHERE "MR_Code" = $7
        AND "Client_ID" = $8
    `;

    const headerResult = await client.query(updateHeaderQuery, [
      MR_Date,
      Supplier_Code,
      Required_Date,
      MR_Status,
      Location_ID,
      userID,
      MR_Code,
      client_id,
    ]);

    if (headerResult.rowCount === 0) {
      throw new Error("MR Header not found or update failed");
    }

    /* ---- Delete old MR transactions ---- */
    await client.query(
      `
      DELETE FROM mr_tran
      WHERE "MR_Code" = $1
        AND "Client_ID" = $2
      `,
      [MR_Code, client_id]
    );

    /* ---- Insert new MR transactions (UNNEST) ---- */
    if (productList && productList.length > 0) {
      const mr_codes = [];
      const entry_dates = [];
      const required_dates = [];
      const product_ids = [];
      const barcodes = [];
      const descriptions = [];
      const uoms = [];
      const qtys = [];
      const users = [];
      const clients = [];
      const locations = [];

      productList.forEach((p) => {
        mr_codes.push(MR_Code);
        entry_dates.push(MR_Date);
        required_dates.push(Required_Date);
        product_ids.push(p.Product_ID);
        barcodes.push(p.Barcode);
        descriptions.push(p.Description);
        uoms.push(p.Product_UM);
        qtys.push(+p.MR_Qty);
        users.push(userID);
        clients.push(client_id);
        locations.push(Location_ID);
      });

      await client.query(
        `
        INSERT INTO mr_tran
        ("MR_Code","Entry_Date","Required_Date","Product_ID","Barcode",
         "Description","Product_UM","MR_Qty","UserID","Client_ID","Location_ID")
        SELECT *
        FROM UNNEST(
          $1::varchar[], $2::date[], $3::date[], $4::varchar[],
          $5::varchar[], $6::varchar[], $7::varchar[],
          $8::numeric[], $9::varchar[], $10::varchar[], $11::varchar[]
        )
        `,
        [
          mr_codes,
          entry_dates,
          required_dates,
          product_ids,
          barcodes,
          descriptions,
          uoms,
          qtys,
          users,
          clients,
          locations,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Material Request updated successfully",
      MR_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update MR Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};

/* =========================
   DELETE MR (SOFT DELETE)
========================= */
exports.deleteMR = async (req, res) => {
  const { MR_Code } = req.params;
  const userID = "01";

  try {
    const result = await db.query(
      `
      UPDATE mr_header
      SET
        "MR_Status" = 'D',
        "Edited_User" = $1,
        "Edited_Date" = NOW()
      WHERE "MR_Code" = $2
        AND "Client_ID" = $3
      `,
      [userID, MR_Code, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "MR not found" });
    }

    await db.query(
      `
      DELETE FROM mr_tran
      WHERE "MR_Code" = $1
        AND "Client_ID" = $2
      `,
      [MR_Code, client_id]
    );

    res.json({ message: "Material Request deleted successfully" });
  } catch (err) {
    console.error("Delete MR Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

/* =========================
   CLOSE SINGLE MR
========================= */
exports.closeMR = async (req, res) => {
  const { MR_Code } = req.params;
  const userID = "01";

  try {
    const result = await db.query(
      `
      UPDATE mr_header
      SET
        "MR_Status" = 'C',
        "Edited_User" = $1,
        "Edited_Date" = NOW()
      WHERE "MR_Code" = $2
        AND "Client_ID" = $3
      `,
      [userID, MR_Code, client_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "MR not found" });
    }

    await db.query(
      `
      DELETE FROM mr_tran
      WHERE "MR_Code" = $1
        AND "Client_ID" = $2
      `,
      [MR_Code, client_id]
    );

    res.json({
      message: "Material Request closed successfully",
      MR_Code,
    });
  } catch (err) {
    console.error("Close MR Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

/* =========================
   CLOSE MULTIPLE MR
========================= */
exports.closeMaterialRequest = async (req, res) => {
  const { mrCodes } = req.body;
  const userID = "01";

  if (!Array.isArray(mrCodes) || mrCodes.length === 0) {
    return res.status(400).json({ message: "No MR_Codes provided" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const mrCode of mrCodes) {
      const result = await client.query(
        `
        UPDATE mr_header
        SET
          "MR_Status" = 'C',
          "Edited_User" = $1,
          "Edited_Date" = NOW()
        WHERE "MR_Code" = $2
          AND "Client_ID" = $3
        `,
        [userID, mrCode, client_id]
      );

      if (result.rowCount === 0) {
        throw new Error(`MR_Code ${mrCode} not found`);
      }

      await client.query(
        `
        DELETE FROM mr_tran
        WHERE "MR_Code" = $1
          AND "Client_ID" = $2
        `,
        [mrCode, client_id]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Material Requests closed successfully",
      mrCodes,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Close Multiple MR Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};
