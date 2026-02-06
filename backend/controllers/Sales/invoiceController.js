const db = require("../../config/db");
const client_id = "940T0003";

exports.getInvoices = async (req, res) => {
  const client_id = "940T0003"; // later from token
  const { location_id, from_date, to_date } = req.query;

  try {
    const result = await db.query(
      `
      SELECT
        ih."INV_Date"          AS invoice_date,
        ih."INV_Code"          AS invoice_number,
        ih."PO_No"             AS po_order,
        cm."Customer_Name"     AS customer_name,
        ih."INV_Status"        AS invoice_status,
        ih."INV_Amount"        AS amount,
        ih."Location_ID"       AS location_id
      FROM "invoice_header" ih
      LEFT JOIN "customer_master" cm
        ON cm."Customer_Code" = ih."Customer_Code"
       AND cm."Client_ID" = ih."Client_ID"
      WHERE ih."Client_ID" = $1
        AND ($2::text IS NULL OR ih."Location_ID" = $2)
        AND ($3::date IS NULL OR ih."INV_Date" >= $3)
        AND ($4::date IS NULL OR ih."INV_Date" <= $4)
      ORDER BY ih."INV_Date" DESC
      `,
      [client_id, location_id || null, from_date || null, to_date || null],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: err.message,
    });
  }
};

exports.getInvoiceHeaderByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM invoice_header
      WHERE "INV_Code" = $1
        AND "Client_ID" = $2
      ORDER BY "Creation_Date" DESC
      `,
      [req.params.id, client_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.getInvoiceTranByID = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM invoice_tran
      WHERE "INV_Code" = $1
        AND "Client_ID" = $2
      `,
      [req.params.id, client_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.getInvoiceById = async (req, res) => {
  const client_id = "940T0003"; // later from token
  const { id } = req.params;

  try {
    // Get invoice header
    const headerResult = await db.query(
      `
      SELECT
        ih."INV_Code"          AS invoice_number,
        ih."INV_Date"          AS invoice_date,
        ih."PO_No"             AS po_order,
        ih."PO_Date"           AS po_date,
        ih."INV_Status"        AS invoice_status,
        ih."INV_Amount"        AS total_amount,
        ih."INV_Tax_Amount"    AS tax_amount,
        ih."Location_ID"       AS location_id,
        cm."Customer_Code"     AS customer_code,
        cm."Customer_Name"     AS customer_name,
        cm."Address"  AS customer_address
      FROM "invoice_header" ih
      LEFT JOIN "customer_master" cm
        ON cm."Customer_Code" = ih."Customer_Code"
       AND cm."Client_ID" = ih."Client_ID"
      WHERE ih."Client_ID" = $1
        AND ih."INV_Code" = $2
      `,
      [client_id, id],
    );

    if (headerResult.rowCount === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const header = headerResult.rows[0];

    // Get invoice line items
    const itemsResult = await db.query(
      `
      SELECT
        "Product_ID"       AS product_id,
        "Description"      AS product_name,
        "Product_UM"       AS unit,
        "INV_Qty"          AS quantity,
        "Unit_Price"       AS rate,
        "Total_Amount"     AS amount,
        "Tax_Amount"       AS tax_amount,
        "Tax_Group_Code"   AS tax_group
      FROM "invoice_tran"
      WHERE "INV_Code" = $1
        AND "Client_ID" = $2
      `,
      [id, client_id],
    );

    const invoice = {
      ...header,
      currency: "LKR",
      company_name: "Your Company Name",
      company_location: "Location",
      company_country: "Country",
      company_email: "email@company.com",
      payment_terms: "Due on Receipt",
      notes: "Thank you for your business.",
      items: itemsResult.rows,
      payment_made: 0,
    };

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch invoice details",
      error: err.message,
    });
  }
};

exports.getInvoicePDF = async (req, res) => {
  const client_id = "940T0003";
  const { id } = req.params;

  try {
    // Get invoice header
    const headerResult = await db.query(
      `
      SELECT
        ih."INV_Code"          AS invoice_number,
        ih."INV_Date"          AS invoice_date,
        ih."PO_No"             AS po_order,
        ih."PO_Date"           AS po_date,
        ih."INV_Status"        AS invoice_status,
        ih."INV_Amount"        AS total_amount,
        ih."INV_Tax_Amount"    AS tax_amount,
        ih."Location_ID"       AS location_id,
        cm."Customer_Code"     AS customer_code,
        cm."Customer_Name"     AS customer_name,
        cm."Address"  AS customer_address
      FROM "invoice_header" ih
      LEFT JOIN "customer_master" cm
        ON cm."Customer_Code" = ih."Customer_Code"
       AND cm."Client_ID" = ih."Client_ID"
      WHERE ih."Client_ID" = $1
        AND ih."INV_Code" = $2
      `,
      [client_id, id],
    );

    if (headerResult.rowCount === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const header = headerResult.rows[0];

    // Get invoice line items
    const itemsResult = await db.query(
      `
      SELECT
        "Product_ID"       AS product_id,
        "Description"      AS product_name,
        "Product_UM"       AS unit,
        "INV_Qty"          AS quantity,
        "Unit_Price"       AS rate,
        "Total_Amount"     AS amount,
        "Tax_Amount"       AS tax_amount,
        "Tax_Group_Code"   AS tax_group
      FROM "invoice_tran"
      WHERE "INV_Code" = $1
        AND "Client_ID" = $2
      `,
      [id, client_id],
    );

    const invoice = {
      ...header,
      currency: "LKR",
      company_name: "Vijay Associates",
      company_location: "Western Province",
      company_country: "SriLanka",
      company_email: "vijayas.cmb@gmail.com",
      payment_terms: "Due on Receipt",
      notes: "Thanks for your business.",
      items: itemsResult.rows,
      payment_made: 0,
    };

    // Calculate totals
    const subTotal = invoice.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const total = subTotal + (Number(invoice.tax_amount) || 0);
    const balanceDue = total - (Number(invoice.payment_made) || 0);

    const fmt = (n) =>
      Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // Generate PDF
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 40 });
    const filename = `invoice_${id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header Section - Company Info (Left) and INVOICE (Right)
    doc.fontSize(12).font("Helvetica-Bold").text(invoice.company_name, 50, 50);
    doc.fontSize(10).font("Helvetica").text(invoice.company_location, 50, 70);
    doc.fontSize(10).text(invoice.company_country, 50, 85);
    doc.fontSize(10).text(invoice.company_email, 50, 100);

    // INVOICE Title and Number (Right aligned)
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("INVOICE", 420, 50, { align: "right" });
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`# ${invoice.invoice_number}`, 420, 80, { align: "right" });

    // Balance Due Box (Right aligned)
    doc.fontSize(9).text("Balance Due", 420, 105, { align: "right" });
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`${invoice.currency} ${fmt(balanceDue)}`, 420, 120, {
        align: "right",
      });

    doc.moveDown(5);

    // Horizontal line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1);

    // Bill To Section
    doc.fontSize(10).font("Helvetica-Bold").text("Bill To");
    doc.fontSize(10).font("Helvetica").text(invoice.customer_name);
    if (invoice.customer_address) {
      doc.fontSize(9).text(invoice.customer_address);
    }

    doc.moveDown(1);

    // Invoice Details (Right side)
    const detailsX = 350;
    doc.fontSize(9).font("Helvetica").text("Invoice Date:", 50, doc.y);
    doc.text(
      new Date(invoice.invoice_date).toLocaleDateString("en-GB"),
      detailsX,
      doc.y - 12,
    );

    doc.moveDown(0.8);
    doc.text("Terms:", 50);
    doc.text(invoice.payment_terms, detailsX, doc.y - 12);

    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    const headerHeight = 20;
    const col1 = 55; // #
    const col2 = 110; // Item & Description
    const col3 = 360; // Qty
    const col4 = 410; // Rate
    const col5 = 480; // Amount

    // Header background
    doc.fillColor("#333333");
    doc.rect(50, tableTop, 500, headerHeight).fill();

    // Header text
    doc.fillColor("white");
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("#", col1, tableTop + 5);
    doc.text("Item & Description", col2, tableTop + 5);
    doc.text("Qty", col3, tableTop + 5);
    doc.text("Rate", col4, tableTop + 5);
    doc.text("Amount", col5, tableTop + 5);

    doc.fillColor("black");
    doc.fontSize(9).font("Helvetica");

    let rowY = tableTop + headerHeight + 3;
    const rowHeight = 18;

    // Table Rows
    invoice.items.forEach((item, index) => {
      doc.text((index + 1).toString(), col1, rowY);

      // Item description with line break if needed
      const itemText = item.product_name || "";
      doc.text(itemText, col2, rowY, { width: 240, ellipsis: true });

      doc.text(`${Number(item.quantity || 0).toFixed(2)}`, col3, rowY, {
        align: "center",
      });
      doc.text(`${fmt(item.rate)}`, col4, rowY, { align: "right" });
      doc.text(`${fmt(item.amount)}`, col5, rowY, { align: "right" });

      rowY += rowHeight;
    });

    doc.moveTo(50, rowY).lineTo(550, rowY).stroke();

    rowY += 10;

    // Summary Section (Right aligned)
    const summaryX = 380;
    doc.fontSize(9).font("Helvetica");

    doc.text("Sub Total", summaryX, rowY);
    doc.text(
      `${subTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      550,
      rowY,
      { align: "right" },
    );

    rowY += 15;

    if (Number(invoice.tax_amount) > 0) {
      doc.text("Tax", summaryX, rowY);
      doc.text(
        `${Number(invoice.tax_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        550,
        rowY,
        { align: "right" },
      );
      rowY += 15;
    }

    // Total line
    doc.moveTo(summaryX, rowY).lineTo(550, rowY).stroke();
    rowY += 5;

    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Total", summaryX, rowY);
    doc.text(`${invoice.currency} ${fmt(total)}`, 550, rowY, {
      align: "right",
    });

    rowY += 15;

    // Payment Made
    if (Number(invoice.payment_made) > 0) {
      doc.fontSize(9).font("Helvetica").fillColor("red");
      doc.text("Payment Made", summaryX, rowY);
      doc.text(`(${fmt(invoice.payment_made)})`, 550, rowY, { align: "right" });
      rowY += 15;
      doc.fillColor("black");
    }

    // Balance Due Box
    doc.fillColor("#e0e0e0");
    doc.rect(summaryX - 30, rowY - 3, 200, 25).fill();
    doc.fillColor("black");
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Balance Due", summaryX, rowY + 5);
    doc.text(`${invoice.currency} ${fmt(balanceDue)}`, 550, rowY + 5, {
      align: "right",
    });

    doc.moveDown(4);

    // Notes Section
    if (invoice.notes) {
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(10).font("Helvetica-Bold").text("Notes");
      doc.fontSize(9).font("Helvetica").text(invoice.notes);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to generate PDF",
      error: err.message,
    });
  }
};

exports.createInvoice = async (req, res) => {
  const { header_data, product_list, total_tax, total_sum } = req.body;
  const client_id = "940T0003";
  const userID = "01";

  if (!client_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    Customer_Code,
    INV_Date,
    PO_No,
    INV_Tax_Amount,
    INV_Additional_Charges,
    INV_Other_Charges,
    INV_Amount,
    PO_Date,
    UserID,
    Location_ID,
    INV_Status,
    Client_ID,
  } = header_data;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    /* ---------- Generate GRN Code ---------- */
    const last = await client.query(
      `
      SELECT "INV_Code"
      FROM "invoice_header"
      WHERE "Client_ID" = $1
      ORDER BY "INV_Code" DESC
      LIMIT 1
      `,
      [client_id],
    );

    let INV_Code = "INV0000000001";
    if (last.rowCount > 0) {
      const num = parseInt(last.rows[0].INV_Code.substring(3)) + 1;
      INV_Code = `INV${num.toString().padStart(10, "0")}`;
    }

    /* ---------- Insert Header ---------- */
    await client.query(
      `
      INSERT INTO "invoice_header" (
        "INV_Code","Customer_Code","INV_Date","PO_No",
        "INV_Tax_Amount","INV_Additional_Charges","INV_Other_Charges",
        "INV_Amount","PO_Date","UserID","Location_ID",
        "INV_Status","Client_ID"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      `,
      [
        INV_Code,
        Customer_Code,
        INV_Date,
        PO_No,
        INV_Tax_Amount,
        INV_Additional_Charges,
        INV_Other_Charges,
        INV_Amount,
        PO_Date ? PO_Date : null,
        UserID,
        Location_ID,
        INV_Status,
        client_id,
      ],
    );

    /* ---------- Prepare UNNEST Arrays ---------- */
    const rows = product_list.map((item) => {
      const p = item.data || {};
      return [
        INV_Code,
        new Date(),
        p.Product_ID,
        p.Barcode,
        p.UOM,
        item.quantity,
        item.unitPrice,
        item.discountRate,
        item.discountAmount,
        item.total,
        userID,
        client_id,
        Location_ID,
        0,
        item.taxAmount,
        item.TaxGroup,
        p.Description,
      ];
    });

    const columns = rows[0].map((_, i) => rows.map((r) => r[i]));

    /* ---------- Bulk Insert using UNNEST ---------- */
    await client.query(
      `
      INSERT INTO "invoice_tran" (
        "INV_Code","Entry_Date","Product_ID","Barcode","Product_UM",
        "INV_Qty","Unit_Price","Discount_Percent","Discount_Amount",
        "Total_Amount","UserID","Client_ID","Location_ID",
        "Tax_Rate","Tax_Amount","Tax_Group_Code","Description"
      )
      SELECT *
      FROM UNNEST (
        $1::text[], $2::timestamp[], $3::text[], $4::text[], $5::text[],
        $6::numeric[], $7::numeric[], $8::numeric[], $9::numeric[],
        $10::numeric[], $11::text[], $12::text[], $13::text[],
        $14::numeric[], $15::numeric[], $16::text[], $17::text[]
      )
      `,
      columns,
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Invoice created successfully",
      INV_Code,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    client.release();
  }
};
