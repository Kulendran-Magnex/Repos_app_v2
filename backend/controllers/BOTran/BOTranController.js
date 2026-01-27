const db = require("../../config/db");

const generateBatchNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 0-based index
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  return `${year}${month}${day}${hour}`;
};

exports.createBOTranFromGRN = async (req, res) => {
  const { GRN_Code } = req.params;

  const Client_ID = "940T0003";
  const UserID = "01";
  const Batch_No = generateBatchNo();

  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0];
  const formattedTime = now.toTimeString().split(" ")[0];

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* =========================
       1️⃣ Get GRN data
       ========================= */
    const grnQuery = `
      SELECT *
      FROM grn_header gh
      JOIN grn_tran gt ON gh."GRN_Code" = gt."GRN_Code"
      WHERE gh."GRN_Code" = $1
        AND gh."Client_ID" = $2
    `;

    const { rows: grnRows } = await client.query(grnQuery, [
      GRN_Code,
      Client_ID,
    ]);

    if (grnRows.length === 0) {
      throw new Error("No GRN data found");
    }

    const itemList = [];

    /* =========================
       2️⃣ Process each GRN line
       ========================= */
    for (const item of grnRows) {
      let Unit_Price = Number(item.Unit_Price || 0);
      const Tran_QTY = Number(item.GRN_Qty || 0) + Number(item.FOC || 0);

      const Barcode = item.Barcode;
      const Location_ID = item.Location_ID;

      /* ---- fallback Unit Price ---- */
      if (Unit_Price === 0) {
        const fallbackQuery = `
          SELECT "Unit_Cost", "Last_Purchase_Price"
          FROM product_details
          WHERE "Barcode" = $1 AND "Client_ID" = $2
          LIMIT 1
        `;

        const { rows } = await client.query(fallbackQuery, [
          Barcode,
          Client_ID,
        ]);

        if (rows.length > 0) {
          Unit_Price =
            Number(rows[0].Last_Purchase_Price) ||
            Number(rows[0].Unit_Cost) ||
            0;
        }
      }
      console.log(
        "values",
        Barcode,
        Client_ID,
        Location_ID,
        formattedDate,
        Tran_QTY,
        item.Total_Amount,
      );
      /* ---- get Average Cost ---- */
      const avgCostResult = await client.query(
        `SELECT * FROM getAverageCost($1,$2,$3,$4,$5,$6)`,
        [
          Barcode,
          Client_ID,
          Location_ID,
          formattedDate,
          Tran_QTY,
          item.Total_Amount,
        ],
      );

      const Average_Cost = avgCostResult.rows[0]?.getaveragecost || 0;

      /* ---- get Stock In Hand ---- */
      const stockResult = await client.query(
        `SELECT * FROM getTotalStock($1,$2,$3,$4,$5)`,
        [Barcode, Client_ID, Location_ID, formattedDate, Tran_QTY],
      );
      console.log("stock:", stockResult);

      const Stock_In_Hand = stockResult.rows[0]?.salesqty || 0;

      const Stock_Value_AC = Average_Cost * Stock_In_Hand;

      itemList.push({
        Location_ID,
        Product_ID: item.Product_ID,
        Description: item.Description,
        Product_UM: item.Product_UM,
        Tran_QTY,
        Unit_Cost: Unit_Price,
        Tran_Cost: item.Total_Amount,
        Batch_No,
        Tran_Type: "GR",
        Tran_Date: formattedDate,
        Tran_Time: formattedTime,
        Posted_Date: formattedDate,
        Posted_By: UserID,
        Document_Code: GRN_Code,
        Average_Cost,
        Tax_Group_Code: item.Tax_Group_Code,
        Tax_Rate: Number(item.Tax_Rate || 0),
        Tax_Amount: Number(item.Tax_Amount || 0),
        Stock_UM_QTY: Tran_QTY,
        Stock_In_Hand,
        Stock_Value_AC,
        Barcode,
        Client_ID,
      });
    }

    /* =========================
       3️⃣ Bulk insert using UNNEST
       ========================= */
    const insertQuery = `
      INSERT INTO bo_tran (
        "Location_ID", "Product_ID", "Description", "Product_UM", "Tran_QTY",
        "Unit_Cost", "Tran_Cost", "Batch_No", "Tran_Type", "Tran_Date", "Tran_Time",
        "Posted_Date", "Posted_By", "Document_Code", "Average_Cost",
        "Tax_Group_Code", "Tax_Rate", "Tax_Amount", "Stock_UM_QTY",
        "Stock_In_Hand", "Stock_Value_AC", "Barcode", "Client_ID"
      )
      SELECT *
      FROM UNNEST(
        $1::varchar[], $2::varchar[], $3::varchar[], $4::varchar[],
        $5::numeric[], $6::numeric[], $7::numeric[], $8::varchar[],
        $9::varchar[], $10::date[], $11::time[],
        $12::date[], $13::varchar[], $14::varchar[],
        $15::numeric[], $16::varchar[], $17::numeric[],
        $18::numeric[], $19::numeric[], $20::numeric[],
        $21::numeric[], $22::varchar[], $23::varchar[]
      )
    `;

    await client.query(insertQuery, [
      itemList.map((i) => i.Location_ID),
      itemList.map((i) => i.Product_ID),
      itemList.map((i) => i.Description),
      itemList.map((i) => i.Product_UM),
      itemList.map((i) => i.Tran_QTY),
      itemList.map((i) => i.Unit_Cost),
      itemList.map((i) => i.Tran_Cost),
      itemList.map((i) => i.Batch_No),
      itemList.map((i) => i.Tran_Type),
      itemList.map((i) => i.Tran_Date),
      itemList.map((i) => i.Tran_Time),
      itemList.map((i) => i.Posted_Date),
      itemList.map((i) => i.Posted_By),
      itemList.map((i) => i.Document_Code),
      itemList.map((i) => i.Average_Cost),
      itemList.map((i) => i.Tax_Group_Code),
      itemList.map((i) => i.Tax_Rate),
      itemList.map((i) => i.Tax_Amount),
      itemList.map((i) => i.Stock_UM_QTY),
      itemList.map((i) => i.Stock_In_Hand),
      itemList.map((i) => i.Stock_Value_AC),
      itemList.map((i) => i.Barcode),
      itemList.map((i) => i.Client_ID),
    ]);

    /* =========================
       4️⃣ Update product_details
       ========================= */
    for (const item of itemList) {
      await client.query(
        `UPDATE product_details
         SET "Last_Purchase_Price" = $1
         WHERE "Barcode" = $2 AND "Client_ID" = $3`,
        [item.Unit_Cost, item.Barcode, Client_ID],
      );
    }

    /* =========================
       5️⃣ Update GRN Header
       ========================= */
    await client.query(
      `UPDATE grn_header
       SET "GRN_Status" = 'P'
       WHERE "GRN_Code" = $1 AND "Client_ID" = $2`,
      [GRN_Code, Client_ID],
    );

    await client.query("COMMIT");

    res.json({
      message: "GRN processed and bo_tran inserted successfully",
      insertedRows: itemList.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("BO Tran Error:", error);

    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

exports.createBOTranWithPR = async (req, res) => {
  const { PR_Code } = req.params;
  const Client_ID = "940T0003";
  const Batch_No = generateBatchNo();
  const UserID = "01";

  const now = new Date();
  const Tran_Date = now.toISOString().split("T")[0];
  const Tran_Time = now.toTimeString().split(" ")[0];

  const formattedDate = now.toISOString().split("T")[0];

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* =========================
       1️⃣ Fetch PR data
       ========================= */
    const prQuery = `
      SELECT *
      FROM pr_header ph
      JOIN pr_tran pt ON ph."PR_Code" = pt."PR_Code"
      WHERE ph."PR_Code" = $1
        AND ph."Client_ID" = $2
    `;

    const { rows: prRows } = await client.query(prQuery, [PR_Code, Client_ID]);

    if (prRows.length === 0) {
      throw new Error("No PR data found.");
    }

    const itemList = [];

    /* =========================
       2️⃣ Process each PR line
       ========================= */
    for (const item of prRows) {
      let Unit_Price = Number(item.Unit_Price || 0);
      const Tran_QTY = Number(item.PR_Qty || 0) * -1;
      const Tran_amount = Number(item.Total_Amount || 0) * -1;
      const Barcode = item.Barcode;
      const Location_ID = item.Location_ID;

      /* ---- fallback Unit Price ---- */
      if (Unit_Price === 0) {
        const fallbackQuery = `
          SELECT "Unit_Cost", "Last_Purchase_Price"
          FROM product_details
          WHERE "Barcode" = $1 AND "Client_ID" = $2
          LIMIT 1
        `;

        const { rows } = await client.query(fallbackQuery, [
          Barcode,
          Client_ID,
        ]);

        if (rows.length > 0) {
          Unit_Price =
            Number(rows[0].Last_Purchase_Price) ||
            Number(rows[0].Unit_Cost) ||
            0;
        }
      }

      /* ---- Average Cost (PROCEDURE) ---- */
      const avgCostResult = await client.query(
        `SELECT * FROM getAverageCost($1,$2,$3,$4,$5,$6)`,
        [Barcode, Client_ID, Location_ID, Tran_Date, Tran_QTY, Tran_amount],
      );

      const Average_Cost = avgCostResult.rows[0]?.getaveragecost || 0;

      /* ---- Stock In Hand (FUNCTION) ---- */
      const stockResult = await client.query(
        `SELECT * FROM getTotalStock($1,$2,$3,$4,$5)`,
        [Barcode, Client_ID, Location_ID, Tran_Date, Tran_QTY],
      );

      const Stock_In_Hand = stockResult.rows[0]?.salesqty || 0;

      if (Stock_In_Hand < 0) {
        throw new Error(
          `Insufficient stock for product ${item.Product_ID} at location ${Location_ID}`,
        );
      }

      const Stock_Value_AC = Average_Cost * Stock_In_Hand;

      console.log("stock_Value_Av", avgCostResult);
      itemList.push({
        Location_ID,
        Product_ID: item.Product_ID,
        Description: item.Description,
        Product_UM: item.Product_UM,
        Tran_QTY,
        Unit_Cost: Unit_Price,
        Tran_Cost: item.Total_Amount,
        Batch_No,
        Tran_Type: "PR",
        Tran_Date,
        Tran_Time,
        Posted_Date: Tran_Date,
        Posted_By: UserID,
        Document_Code: PR_Code,
        Average_Cost,
        Tax_Group_Code: item.Tax_Group_Code,
        Tax_Rate: Number(item.Tax_Rate || 0),
        Tax_Amount: Number(item.Tax_Amount || 0),
        Stock_UM_QTY: Tran_QTY,
        Stock_In_Hand,
        Stock_Value_AC,
        Barcode,
        Client_ID,
      });
    }

    /* =========================
       3️⃣ Insert into BO_Tran (UNNEST)
       ========================= */
    const insertQuery = `
      INSERT INTO bo_tran (
        "Location_ID", "Product_ID", "Description", "Product_UM", "Tran_QTY",
        "Unit_Cost", "Tran_Cost", "Batch_No", "Tran_Type",
        "Tran_Date", "Tran_Time", "Posted_Date", "Posted_By",
        "Document_Code", "Average_Cost", "Tax_Group_Code",
        "Tax_Rate", "Tax_Amount", "Stock_UM_QTY",
        "Stock_In_Hand", "Stock_Value_AC", "Barcode", "Client_ID"
      )
      SELECT *
      FROM UNNEST(
        $1::varchar[], $2::varchar[], $3::varchar[], $4::varchar[],
        $5::numeric[], $6::numeric[], $7::numeric[], $8::varchar[],
        $9::varchar[], $10::date[], $11::time[],
        $12::date[], $13::varchar[], $14::varchar[],
        $15::numeric[], $16::varchar[], $17::numeric[],
        $18::numeric[], $19::numeric[], $20::numeric[],
        $21::numeric[], $22::varchar[], $23::varchar[]
      )
    `;

    await client.query(insertQuery, [
      itemList.map((i) => i.Location_ID),
      itemList.map((i) => i.Product_ID),
      itemList.map((i) => i.Description),
      itemList.map((i) => i.Product_UM),
      itemList.map((i) => i.Tran_QTY),
      itemList.map((i) => i.Unit_Cost),
      itemList.map((i) => i.Tran_Cost),
      itemList.map((i) => i.Batch_No),
      itemList.map((i) => i.Tran_Type),
      itemList.map((i) => i.Tran_Date),
      itemList.map((i) => i.Tran_Time),
      itemList.map((i) => i.Posted_Date),
      itemList.map((i) => i.Posted_By),
      itemList.map((i) => i.Document_Code),
      itemList.map((i) => i.Average_Cost),
      itemList.map((i) => i.Tax_Group_Code),
      itemList.map((i) => i.Tax_Rate),
      itemList.map((i) => i.Tax_Amount),
      itemList.map((i) => i.Stock_UM_QTY),
      itemList.map((i) => i.Stock_In_Hand),
      itemList.map((i) => i.Stock_Value_AC),
      itemList.map((i) => i.Barcode),
      itemList.map((i) => i.Client_ID),
    ]);

    /* =========================
      Update PR Header
       ========================= */
    await client.query(
      `UPDATE pr_header
       SET "PR_Status" = 1
       WHERE "PR_Code" = $1 AND "Client_ID" = $2`,
      [PR_Code, Client_ID],
    );

    await client.query("COMMIT");

    res.json({
      message: "PR processed and bo_tran inserted successfully",
      insertedRows: itemList.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("BO Tran With PR Error:", error);

    res.status(500).json({
      error: error.message || "Processing failed",
    });
  } finally {
    client.release();
  }
};

exports.createBOTranFromAdjustment = async (req, res) => {
  const { AD_Code } = req.params;
  const Client_ID = "940T0003";
  const Batch_No = generateBatchNo();
  const Posted_By = "01";

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const Tran_Date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const Tran_Time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ----------------------------------------------------
       1. Fetch Adjustment Header + Detail
    ---------------------------------------------------- */
    const adjustmentQuery = `
      SELECT ah.*, ad.*
      FROM adjustment_header ah
      JOIN adjustment_detail ad
        ON ah."Adjustment_ID" = ad."Adjustment_ID"
      WHERE ah."Adjustment_ID" = $1
        AND ad."Client_ID" = $2
    `;
    const { rows: adjustmentRows } = await client.query(adjustmentQuery, [
      AD_Code,
      Client_ID,
    ]);

    if (adjustmentRows.length === 0) {
      throw new Error("No Adjustment data found");
    }

    const values = [];
    const placeholders = [];
    let index = 1;

    /* ----------------------------------------------------
       2. Process Each Item
    ---------------------------------------------------- */
    for (const item of adjustmentRows) {
      let Unit_Cost = Number(item.Unit_Cost || 0);
      const Tran_QTY = Number(item.Adjustment_QTY || 0);
      const Location_ID = item.Location_ID;
      const Barcode = item.Barcode;

      /* ---- Fallback Unit Cost ---- */
      if (Unit_Cost === 0) {
        const fallbackQuery = `
          SELECT "Unit_Cost", "Last_Purchase_Price"
          FROM product_details
          WHERE "Barcode" = $1 AND "Client_ID" = $2
          LIMIT 1
        `;
        const { rows } = await client.query(fallbackQuery, [
          Barcode,
          Client_ID,
        ]);

        if (rows.length > 0) {
          Unit_Cost =
            Number(rows[0].Last_Purchase_Price) ||
            Number(rows[0].Unit_Cost) ||
            0;
        }
      }

      /* ---- Average Cost ---- */
      const avgCostResult = await client.query(
        `SELECT * FROM getAverageCost($1,$2,$3,$4,$5,$6)`,
        [
          Barcode,
          Client_ID,
          Location_ID,
          Tran_Date,
          Tran_QTY,
          item.Adjustment_Cost,
        ],
      );

      const Average_Cost = avgCostResult.rows[0]?.getaveragecost || 0;

      console.log("Average_cost", Average_Cost);

      /* ---- Stock in Hand ---- */
      const stockResult = await client.query(
        `SELECT * FROM getTotalStock($1,$2,$3,$4,$5)`,
        [Barcode, Client_ID, Location_ID, Tran_Date, Tran_QTY],
      );

      const Stock_In_Hand = stockResult.rows[0]?.salesqty || 0;

      const Stock_Value_AC = Average_Cost * Stock_In_Hand;

      console.log("stock_Value_AC", Stock_Value_AC);

      if (Stock_In_Hand < 0) {
        throw new Error(
          `Insufficient stock for Product_ID ${item.Product_ID} at Location_ID ${Location_ID}`,
        );
      }

      /* ---- Prepare Insert ---- */
      placeholders.push(`(
        $${index++}, $${index++}, $${index++}, $${index++}, $${index++},
        $${index++}, $${index++}, $${index++}, $${index++}, $${index++},
        $${index++}, $${index++}, $${index++}, $${index++}, $${index++},
        $${index++}, $${index++}, $${index++}, $${index++}, $${index++}
      )`);

      values.push(
        Location_ID,
        item.Product_ID,
        item.Description,
        item.Adjustment_UM,
        Tran_QTY,
        Unit_Cost,
        Math.abs(Number(item.Adjustment_Cost || 0)),
        Batch_No,
        "AD",
        Tran_Date,
        Tran_Time,
        Tran_Date,
        Posted_By,
        AD_Code,
        Average_Cost,
        Tran_QTY,
        Stock_In_Hand,
        Stock_Value_AC,
        Barcode,
        Client_ID,
      );
    }

    /* ----------------------------------------------------
       3. Insert into bo_tran (COLUMN NAMES UNCHANGED)
    ---------------------------------------------------- */
    const insertQuery = `
      INSERT INTO bo_tran (
        "Location_ID", "Product_ID", "Description", "Product_UM", "Tran_QTY",
        "Unit_Cost", "Tran_Cost", "Batch_No", "Tran_Type", "Tran_Date", "Tran_Time",
        "Posted_Date", "Posted_By", "Document_Code", "Average_Cost",
        "Stock_UM_QTY", "Stock_In_Hand", "Stock_Value_AC", "Barcode", "Client_ID"
      )
      VALUES ${placeholders.join(",")}
    `;

    const insertResult = await client.query(insertQuery, values);

    await client.query("COMMIT");

    res.json({
      message: "Adjustment processed successfully",
      insertedRows: insertResult.rowCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Adjustment BO Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.createBOTranFromTransfer = async (req, res) => {
  const { Transfer_Code } = req.params;
  const Client_ID = "940T0003";
  const Batch_No = generateBatchNo();
  const Posted_By = "01";

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const Tran_Date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const Tran_Time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ----------------------------------------------------
       1. Fetch Transfer Header + Detail
    ---------------------------------------------------- */
    const fetchQuery = `
      SELECT ah.*, ad.*
      FROM transfer_header ah
      JOIN transfer_detail ad
        ON ah."Transfer_ID" = ad."Transfer_ID"
      WHERE ah."Transfer_ID" = $1
        AND ad."Client_ID" = $2
    `;

    const { rows } = await client.query(fetchQuery, [Transfer_Code, Client_ID]);

    if (rows.length === 0) {
      throw new Error("No Transfer data found");
    }

    /* ----------------------------------------------------
       Common Insert Query
    ---------------------------------------------------- */
    const insertQuery = `
      INSERT INTO bo_tran (
        "Location_ID", "Product_ID", "Description", "Product_UM", "Tran_QTY",
        "Unit_Cost", "Tran_Cost", "Batch_No", "Tran_Type",
        "Tran_Date", "Tran_Time", "Posted_Date", "Posted_By",
        "Document_Code", "Average_Cost",
        "Stock_UM_QTY", "Stock_In_Hand", "Stock_Value_AC",
        "Barcode", "Client_ID"
      )
      VALUES
    `;

    /* ====================================================
       2. FROM LOCATION (STOCK OUT)
    ==================================================== */
    let fromIndex = 1;
    const fromPlaceholders = [];
    const fromValues = [];

    for (const item of rows) {
      const Barcode = item.Barcode;
      const Location_From = item.Location_From_ID;
      const Tran_QTY = -Math.abs(Number(item.Transfer_QTY || 0));
      let Unit_Cost = Number(item.Unit_Cost || 0);
      const Tran_Cost = -Math.abs(Number(item.Transfer_Cost || 0));

      /* ---- Fallback Unit Cost ---- */
      if (Unit_Cost === 0) {
        const { rows: costRows } = await client.query(
          `SELECT "Unit_Cost", "Last_Purchase_Price"
           FROM product_details
           WHERE "Barcode" = $1 AND "Client_ID" = $2
           LIMIT 1`,
          [Barcode, Client_ID],
        );

        if (costRows.length > 0) {
          Unit_Cost =
            Number(costRows[0].Last_Purchase_Price) ||
            Number(costRows[0].Unit_Cost) ||
            0;
        }
      }

      /* ---- Average Cost ---- */
      const avgCostRes = await client.query(
        `SELECT * FROM getAverageCost($1,$2,$3,$4,$5,$6)`,
        [Barcode, Client_ID, Location_From, Tran_Date, Tran_QTY, Tran_Cost],
      );
      const Average_Cost = avgCostRes.rows[0]?.getaveragecost || 0;

      /* ---- Stock Check ---- */
      const stockRes = await client.query(
        `SELECT * FROM getTotalStock($1,$2,$3,$4,$5)`,
        [Barcode, Client_ID, Location_From, Tran_Date, Tran_QTY],
      );
      const Stock_In_Hand = stockRes.rows[0]?.salesqty || 0;

      if (Stock_In_Hand < 0) {
        throw new Error(
          `Insufficient stock for Product ${item.Product_ID} at Location ${Location_From}`,
        );
      }

      const Stock_Value_AC = Stock_In_Hand * Average_Cost;

      fromPlaceholders.push(`(
        $${fromIndex++}, $${fromIndex++}, $${fromIndex++}, $${fromIndex++}, $${fromIndex++},
        $${fromIndex++}, $${fromIndex++}, $${fromIndex++}, $${fromIndex++},
        $${fromIndex++}, $${fromIndex++}, $${fromIndex++}, $${fromIndex++},
        $${fromIndex++}, $${fromIndex++},
        $${fromIndex++}, $${fromIndex++}, $${fromIndex++},
        $${fromIndex++}, $${fromIndex++}
      )`);

      fromValues.push(
        Location_From,
        item.Product_ID,
        item.Description,
        item.Transfer_UM,
        Tran_QTY,
        Unit_Cost,
        Math.abs(Tran_Cost),
        Batch_No,
        "TR",
        Tran_Date,
        Tran_Time,
        Tran_Date,
        Posted_By,
        Transfer_Code,
        Average_Cost,
        Tran_QTY,
        Stock_In_Hand,
        Stock_Value_AC,
        Barcode,
        Client_ID,
      );
    }

    const fromResult = await client.query(
      insertQuery + fromPlaceholders.join(","),
      fromValues,
    );

    /* ====================================================
       3. TO LOCATION (STOCK IN)
    ==================================================== */
    let toIndex = 1;
    const toPlaceholders = [];
    const toValues = [];

    for (const item of rows) {
      const Barcode = item.Barcode;
      const Location_To = item.Location_To_ID;
      const Tran_QTY = Math.abs(Number(item.Transfer_QTY || 0));
      let Unit_Cost = Number(item.Unit_Cost || 0);
      const Tran_Cost = Math.abs(Number(item.Transfer_Cost || 0));

      /* ---- Fallback Unit Cost ---- */
      if (Unit_Cost === 0) {
        const { rows: costRows } = await client.query(
          `SELECT "Unit_Cost", "Last_Purchase_Price"
           FROM product_details
           WHERE "Barcode" = $1 AND "Client_ID" = $2
           LIMIT 1`,
          [Barcode, Client_ID],
        );

        if (costRows.length > 0) {
          Unit_Cost =
            Number(costRows[0].Last_Purchase_Price) ||
            Number(costRows[0].Unit_Cost) ||
            0;
        }
      }

      /* ---- Average Cost ---- */
      const avgCostRes = await client.query(
        `SELECT * FROM getAverageCost($1,$2,$3,$4,$5,$6)`,
        [Barcode, Client_ID, Location_To, Tran_Date, Tran_QTY, Tran_Cost],
      );
      const Average_Cost = avgCostRes.rows[0]?.getaveragecost || 0;

      /* ---- Stock ---- */
      const stockRes = await client.query(
        `SELECT * FROM getTotalStock($1,$2,$3,$4,$5)`,
        [Barcode, Client_ID, Location_To, Tran_Date, Tran_QTY],
      );
      const Stock_In_Hand = stockRes.rows[0]?.salesqty || 0;
      const Stock_Value_AC = Stock_In_Hand * Average_Cost;

      toPlaceholders.push(`(
        $${toIndex++}, $${toIndex++}, $${toIndex++}, $${toIndex++}, $${toIndex++},
        $${toIndex++}, $${toIndex++}, $${toIndex++}, $${toIndex++},
        $${toIndex++}, $${toIndex++}, $${toIndex++}, $${toIndex++},
        $${toIndex++}, $${toIndex++},
        $${toIndex++}, $${toIndex++}, $${toIndex++},
        $${toIndex++}, $${toIndex++}
      )`);

      toValues.push(
        Location_To,
        item.Product_ID,
        item.Description,
        item.Transfer_UM,
        Tran_QTY,
        Unit_Cost,
        Tran_Cost,
        Batch_No,
        "TR",
        Tran_Date,
        Tran_Time,
        Tran_Date,
        Posted_By,
        Transfer_Code,
        Average_Cost,
        Tran_QTY,
        Stock_In_Hand,
        Stock_Value_AC,
        Barcode,
        Client_ID,
      );
    }

    const toResult = await client.query(
      insertQuery + toPlaceholders.join(","),
      toValues,
    );

    await client.query(
      `UPDATE transfer_header
       SET "Status" = 1
       WHERE "Transfer_Code" = $1 AND "Client_ID" = $2`,
      [Transfer_Code, Client_ID],
    );

    await client.query("COMMIT");

    res.json({
      message: "Transfer BO posting completed successfully",
      insertedRows: fromResult.rowCount + toResult.rowCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("BO Transfer Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
