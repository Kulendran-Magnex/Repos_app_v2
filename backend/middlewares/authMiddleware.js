const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const { rows } = await db.query(
      "SELECT current_session FROM users WHERE id = $1",
      [decoded.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 SINGLE-SESSION CHECK
    if (rows[0].current_session !== token) {
      return res.status(403).json({
        message:
          "You have been logged out because your account was used on another device",
      });
    }

    // ✅ Attach user globally
    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH VERIFY ERROR:", err);
    return res.status(500).json({ message: "Auth verification failed" });
  }
};

module.exports = authenticateUser;
