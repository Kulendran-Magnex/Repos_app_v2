const db = require("../config/db"); // pg Pool
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Get user + client info
    const result = await db.query(
      `
      SELECT 
        u.id AS user_id,
        u.username,
        u.password,
        c.client_id,
        c.database
      FROM "users" u
      JOIN "clients" c ON c.user_id = u.id
      WHERE u.username = $1
      LIMIT 1
      `,
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        client_id: user.client_id,
        database: user.database,
      },
      SECRET_KEY,
      { expiresIn: "5h" }
    );

    // 4. Save session token
    await db.query(
      `UPDATE "users" SET "current_session" = $1 WHERE "id" = $2`,
      [token, user.user_id]
    );

    // 5. Respond
    return res.json({
      message: "Login successful",
      token,
      client_id: user.client_id,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/* =========================
   LOGOUT
========================= */
exports.logout = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token required" });
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, SECRET_KEY);

    // 2. Clear current session
    const result = await db.query(
      `UPDATE "users" SET "current_session" = NULL WHERE "id" = $1`,
      [decoded.user_id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or already logged out" });
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
