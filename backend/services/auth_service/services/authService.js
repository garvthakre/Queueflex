const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const config = require("../config/config");

class AuthService {
  async signup(name, email, password, is_admin) {
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminFlag = is_admin ? 1 : 0; // Convert boolean to integer for SQLite

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)`,
        [name, email, passwordHash, adminFlag],
        function (err) {
          if (err) {
            reject(new Error("Email already registered"));
            return;
          }
          resolve({
            user_id: this.lastID,
            message: "User registered successfully",
            is_admin: !!is_admin,
          });
        },
      );
    });
  }

  async login(email, password) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        async (err, row) => {
          if (err) {
            reject(new Error("Database error"));
            return;
          }

          if (!row) {
            reject(new Error("User not found"));
            return;
          }

          const valid = await bcrypt.compare(password, row.password_hash);
          if (!valid) {
            reject(new Error("Incorrect password"));
            return;
          }

          const token = jwt.sign(
            { user_id: row.id, is_admin: !!row.is_admin },
            config.JWT_SECRET_KEY,
            { expiresIn: `${config.TOKEN_EXPIRATION_HOURS}h` },
          );

          console.log(
            `[AUTH SERVICE] ✓ Login: User ${row.id}, Admin: ${!!row.is_admin}`,
          );

          resolve({
            token,
            user_id: row.id,
            admin: !!row.is_admin,
          });
        },
      );
    });
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
