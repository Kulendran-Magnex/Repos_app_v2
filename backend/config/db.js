const { Pool } = require("pg");

// Ensure special characters in the password are URL-encoded (e.g. '@' => '%40')
const connectionString = process.env.DATABASE_URL;

// Only enable SSL for non-local production databases. Some DB servers (local
// dev instances) do not support SSL and will return "The server does not
// support SSL connections" if a client attempts to use SSL.
let sslOption = false;
if (process.env.NODE_ENV === "production") {
  const isLocal =
    connectionString &&
    (connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1"));
  sslOption = isLocal ? false : { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString,
  ssl: sslOption,
});

module.exports = pool;
