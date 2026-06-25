const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/db");
const config = require("../config/config");

class AuthService {
  async signup(name, email, password, is_admin) {
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminFlag = !!is_admin;

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, is_admin)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, email, passwordHash, adminFlag]
    );

    return {
      user_id: result.rows[0].id,
      message: "User registered successfully",
      is_admin: adminFlag,
    };
  }

  async login(email, password) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash);

    if (!valid) {
      throw new Error("Incorrect password");
    }

    const token = jwt.sign(
      { user_id: row.id, is_admin: row.is_admin },
      config.JWT_SECRET_KEY,
      { expiresIn: `${config.TOKEN_EXPIRATION_HOURS}h` }
    );

    console.log(`[AUTH SERVICE] ✓ Login: User ${row.id}, Admin: ${row.is_admin}`);

    return {
      token,
      user_id: row.id,
      admin: row.is_admin,
    };
  }

  verifyToken(token) {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET_KEY);
      console.log(`[AUTH SERVICE] ✓✓✓ TOKEN VALID ✓✓✓`);
      console.log(`[AUTH SERVICE] Payload:`, payload);

      return {
        is_valid: true,
        user_id: parseInt(payload.user_id),
        is_admin: Boolean(payload.is_admin),
      };
    } catch (err) {
      console.log(`[AUTH SERVICE] ✗✗✗ TOKEN INVALID ✗✗✗`);
      console.log(`[AUTH SERVICE] Error: ${err.message}`);

      return {
        is_valid: false,
        user_id: 0,
        is_admin: false,
      };
    }
  }
}

module.exports = new AuthService();