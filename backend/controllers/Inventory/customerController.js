const db = require("../../config/db");
const client_id = "940T0003";

exports.getCustomers = async (req, res) => {
  const client = await db.connect();

  try {
    const { rows } = await client.query(
      `SELECT *
       FROM "VW_Customer_List"
       WHERE  "Client_ID" = $1
       ORDER BY  "Customer_Code"`,
      [client_id],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching customers" });
  } finally {
    client.release();
  }
};

exports.createCustomer = async (req, res) => {
  const client_id = "940T0003";
  const {
    customer_code,
    customer_name,
    phone_no,
    email,
    address,
    credit_limit,
    customer_type,
    is_active,
  } = req.body;

  const { rows } = await db.query(
    `
      SELECT "Customer_Code"
      FROM customer_master
      WHERE "Client_ID" = $1
      ORDER BY "Customer_Code" DESC
      LIMIT 1
      `,
    [client_id],
  );

  let nextId = "Cus000001";

  if (rows.length > 0) {
    const lastNumber = parseInt(rows[0].Customer_Code.substring(3), 10);
    nextId = `Cus${String(lastNumber + 1).padStart(6, "0")}`;
  }

  await db.query(
    `INSERT INTO customer_master
     ( "Customer_Code","Customer_Name", "Phone_No",  "Email", "Address",
      "Credit_Limit",  "Customer_Type",  "Is_Active",  "Client_ID")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      nextId,
      customer_name,
      phone_no,
      email,
      address,
      credit_limit || 0,
      customer_type,
      is_active ?? true,
      client_id,
    ],
  );

  res.json({ message: "Customer created" });
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    customer_name,
    phone_no,
    email,
    address,
    credit_limit,
    customer_type,
    is_active,
  } = req.body;

  await db.query(
    `UPDATE customer_master SET
      "Customer_Name"=$1,
      "Phone_No"=$2,
      "Email"=$3,
      "Address"=$4,
      "Credit_Limit"=$5,
      "Customer_Type"=$6,
      "Is_Active"=$7
     WHERE  "Customer_ID"=$8`,
    [
      customer_name,
      phone_no,
      email,
      address,
      credit_limit,
      customer_type,
      is_active,
      id,
    ],
  );

  res.json({ message: "Customer updated" });
};
