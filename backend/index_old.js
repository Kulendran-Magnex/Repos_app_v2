const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  methods: "GET, POST, PUT, DELETE", // Specify allowed methods
  allowedHeaders: "Content-Type, Authorization", // Specify allowed headers
};

app.use(cors(corsOptions));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "repos_bo",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

// Middleware
app.use(express.json());

// JWT Secret key
const SECRET_KEY = "fgergrtgeewff";
//process.env.JWT_SECRET_KEY;

// User login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result[0];

      // Compare password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check if a session already exists
      // if (user.current_session) {
      //     return res.status(400).json({ message: 'User is already logged in on another device' });
      // }

      // Generate JWT token
      const payload = { id: user.id, username: user.username };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1" }); // Set token expiration to 1 hour

      // Store the current session (token) in the database for that user
      db.query(
        "UPDATE users SET current_session = ? WHERE id = ?",
        [token, user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update session" });
          }
          res.json({ message: "Login successful", token });
        }
      );
    }
  );
});

// User logout route (invalidate session)
app.post("/logout", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token required" });
  }

  // Decode the token
  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }

  // Invalidate the current session
  db.query(
    "UPDATE users SET current_session = NULL WHERE id = ?",
    [decoded.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    }
  );
});

app.get("/catlvl1", (req, res) => {
  const client_id = "940T0003";

  db.query(
    " SELECT * FROM category_lvl1 WHERE Client_id = ?",
    [client_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error Occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.get("/products", (req, res) => {
  const client_id = "940T0003";

  db.query(
    `SELECT p.Product_ID, p.Product_Ref,c.Cat_Name, p.Description, pp.Retail_Price, p.Stock_UM 
     FROM products p 
     JOIN product_price pp ON p.Product_ID = pp.Product_ID
     JOIN category_lvl1 c ON p.Category_Lv1 = c.Cat_Code
     WHERE p.Client_id = ?`,
    [client_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.get("/products/:product_id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.product_id;

  db.query(
    `SELECT * FROM products WHERE Client_id =? AND Product_ID=?`,
    [client_id, productId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.get("/productsDetails/:product_id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.product_id;

  db.query(
    `SELECT * FROM product_details WHERE Client_id =? AND Product_ID=?`,
    [client_id, productId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.put("/products/:id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.id;
  const {
    Product_Ref,
    Product_Status,
    Category_Lv1,
    Category_Lv2,
    Category_Lv3,
    Description,
    Description_Long,
    Product_Type,
    Stock_UM,
    Description2,
    Description_Long2,
    Base_UM,
  } = req.body;

  // SQL query to update the product
  const query = `
    UPDATE products
    SET 
      Product_Ref = ?,
      Product_Status = ?,
      Category_Lv1 = ?,
      Category_Lv2 = ?,
      Category_Lv3 = ?,
      Description = ?,
      Description_Long = ?,
      Product_Type = ?,
      Stock_UM = ?,
      Description2 = ?,
      Description_Long2 = ?,
      Base_UM = ?
    WHERE Product_ID = ? AND Client_id = ?
  `;

  const values = [
    Product_Ref,
    Product_Status,
    Category_Lv1,
    Category_Lv2,
    Category_Lv3,
    Description,
    Description_Long,
    Product_Type,
    Stock_UM,
    Description2,
    Description_Long2,
    Base_UM,
    productId,
    client_id,
  ];

  // Execute the query to update the product
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating product:", err.message);
      return res.status(500).send("Error updating product");
    }

    // Send a success response
    res.status(200).send({ message: "Product updated successfully", result });
  });
});

app.post("/productDetails/add", (req, res) => {
  const client_id = "940T0003"; // Assuming this is a fixed value for the client
  const {
    Product_ID,
    Barcode,
    Description,
    Description_Long,
    Description2,
    Description_Long2,
    Product_UOM,
    UM_QTY,
    Unit_Cost,
    Last_Purchase_Price,
    Base_UM,
    Prod_Status,
  } = req.body;

  // SQL query to insert a new product
  const query = `
    INSERT INTO product_details (
      Product_ID,Barcode, Description, Description_Long, Description2, 
      Description_Long2, Product_UOM, UM_QTY, Unit_Cost, 
      Last_Purchase_Price, Base_UM, Prod_Status, Client_id
    ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Product_ID,
    Barcode,
    Description,
    Description_Long,
    Description2,
    Description_Long2,
    Product_UOM,
    UM_QTY,
    Unit_Cost,
    Last_Purchase_Price,
    Base_UM,
    Prod_Status,
    client_id,
  ];

  // Execute the query to insert the new product
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error adding product details:", err.message);
      return res.status(500).send("Error adding product");
    }

    // Send a success response
    res.status(201).send({ message: "Product added successfully", result });
  });
});

app.put("/productDetails/:id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.id;
  const {
    Barcode,
    Description,
    Description_Long,
    Description2,
    Description_Long2,
    Product_UOM,
    UM_QTY,
    Unit_Cost,
    Last_Purchase_Price,
    Base_UM,
    Prod_Status,
  } = req.body;

  // SQL query to update the product
  const query = `
    UPDATE product_details
    SET 
      Product_UOM = ?,
      UM_QTY = ?,
      Unit_Cost = ?,
      Last_Purchase_Price = ?,
      Prod_Status = ?
    WHERE Product_ID = ? AND Barcode = ? AND Client_id = ?
  `;

  const values = [
    Product_UOM,
    UM_QTY,
    Unit_Cost,
    Last_Purchase_Price,
    Prod_Status,
    productId,
    Barcode,
    client_id,
  ];

  // Execute the query to update the product
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating product:", err.message);
      return res.status(500).send("Error updating product");
    }

    // Send a success response
    res.status(200).send({ message: "Product updated successfully", result });
  });
});

app.put("/productPrice/:id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.id;
  const {
    Barcode,
    Location_Group,
    Retail_Price,
    Retail_Price2,
    Retail_Price3,
    Wholesale_Price,
    MRP,
    Prod_Status,
  } = req.body;

  // SQL query to update the product
  const query = `
    UPDATE product_price
    SET 
      Location_Group = ?,
      Retail_Price = ?,
      Retail_Price2 = ?,
      Retail_Price3 = ?,
      Wholesale_Price = ?,
      MRP = ?
    WHERE Product_ID = ? AND Barcode = ? AND Client_id = ?
  `;

  const values = [
    Location_Group,
    Retail_Price,
    Retail_Price2,
    Retail_Price3,
    Wholesale_Price,
    MRP,
    productId,
    Barcode,
    client_id,
  ];

  // Execute the query to update the product
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating product:", err.message);
      return res.status(500).send("Error updating product price");
    }

    // Send a success response
    res
      .status(200)
      .send({ message: "Product Price updated successfully", result });
  });
});

app.get("/location", (req, res) => {
  const client_id = "940T0003";

  db.query(
    `SELECT * FROM location_group_setup WHERE Client_id =? `,
    [client_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.get("/packingMaster", (req, res) => {
  const client_id = "940T0003";

  db.query(
    `SELECT * FROM packing_master WHERE Client_id =? `,
    [client_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.post("/catlvl2", (req, res) => {
  const client_id = "940T0003";
  const { catlvl1_id } = req.body;
  db.query(
    " SELECT * FROM category_lvl2 WHERE Client_id = ? AND Cat_Code = ?",
    [client_id, catlvl1_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error Occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.get("/price/:product_id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.product_id;

  db.query(
    `SELECT * FROM product_price WHERE Client_id =? AND Product_ID=?`,
    [client_id, productId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error occurred" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(result);
    }
  );
});

app.put("/price/:id", (req, res) => {
  const client_id = "940T0003";
  const productId = req.params.id;
  const {
    Barcode,
    Location_Group,
    Retail_Price,
    Retail_Price2,
    Retail_Price3,
    Wholesale_Price,
    MRP,
    Prod_Status,
  } = req.body;

  // SQL query to update the product
  const query = `
     UPDATE product_price
    SET 
      Barcode = ?,
      Location_Group = ?,
      Retail_Price = ?,
      Retail_Price2 = ?,
      Retail_Price3 = ?,
      Wholesale_Price = ?,
      MRP = ?,
      Prod_Status = ?
    WHERE Product_ID = ? AND Client_id = ?
  `;

  const values = [
    Barcode,
    Location_Group,
    Retail_Price,
    Retail_Price2,
    Retail_Price3,
    Wholesale_Price,
    MRP,
    Prod_Status,
    productId,
    client_id,
  ];

  // Execute the query to update the product
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating product Price:", err.message);
      return res.status(500).send("Error updating product");
    }

    // Send a success response
    res.status(200).send({ message: "Product updated successfully", result });
  });
});

// app.get("/product", (req, res) => {
//   const client_id = "940T0003";

//   db.query(
//     " SELECT * FROM products WHERE Client_id = ?",
//     [client_id],
//     (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: "Error Occurred" });
//       }
//       if (result.length === 0) {
//         return res.status(404).json({ message: "Data not found" });
//       }
//       return res.json(result);
//     }
//   );
// });

app.get("/report", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  // Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const { username } = decoded;

  // Now, check if the token matches the current_token stored in the database
  db.query(
    "SELECT current_session FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to check session token" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result[0];

      // Compare the token in the database with the provided token
      if (user.current_session !== token) {
        return res
          .status(401)
          .json({ message: "Session token mismatch. Please log in again." });
      }

      // If tokens match, proceed with fetching the report data
      //   db.query('SELECT * FROM reports WHERE user_id = ?', [decoded.id], (err, report) => {
      //     if (err) {
      //       return res.status(500).json({ message: 'Failed to fetch report' });
      //     }
      //     res.json(report);
      //   });

      return res.status(200).json({ message: "can access" });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
