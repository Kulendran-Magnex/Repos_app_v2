const db = require("../../config/db"); // pg Pool
const client_id = "940T0003"; // move to .env later

// GET /api/reports/sales-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build WHERE clause dynamically and parameterize values
    let where = `"Client_ID" = $1`;
    const params = [client_id];

    if (startDate && endDate) {
      // filter by date range (compare by date part)
      params.push(startDate);
      params.push(endDate);
      where += ` AND ("INV_Date"::date BETWEEN $${params.length - 1} AND $${params.length})`;
    } else if (startDate) {
      params.push(startDate);
      where += ` AND ("INV_Date"::date >= $${params.length})`;
    } else if (endDate) {
      params.push(endDate);
      where += ` AND ("INV_Date"::date <= $${params.length})`;
    }

    const sql = `
      SELECT "INV_Date",
             count("INV_Code") AS count,
             sum("INV_Amount")::numeric(18,2) AS sum
      FROM invoice_header
      WHERE ${where}
      GROUP BY "INV_Date"
      ORDER BY "INV_Date"
    `;

    const result = await db.query(sql, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
