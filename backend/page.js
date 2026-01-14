const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

//MySQL connection

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "employee_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

//Middleware
app.use(express.json());

//JWT Secret Key
const SECRET_KEY = "GVBRTRHRTHRHHTWS";
//process.env.JWT_SECRET_KEY;

//User login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //Check if user exists
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result[0];

      //Compare password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Password" });
      }

      //Generate JWT token
      const payload = { id: user.id, username: user.username };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: 5 * 60 });

      db.query(
        "UPDATE users SET current_session = ? WHERE id = ?",
        [token, user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update session" });
          }

          res.json({ message: "Login Successful", token });
        }
      );
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
