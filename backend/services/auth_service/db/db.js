const { Pool } = require("pg");
const config = require("../config/config");

const pool = new Pool({ connectionString: config.DATABASE_URL });

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE
    )
  `);
  console.log("[DB] Users table initialized");
};

module.exports = { pool, initDB };