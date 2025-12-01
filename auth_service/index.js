require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET_KEY = process.env.JWT_SECRET_KEY || "my_super_secret_key_12345";
const TOKEN_EXPIRATION_HOURS = process.env.TOKEN_EXPIRATION_HOURS || 24;

console.log(`[AUTH REST] JWT Secret: ${SECRET_KEY}`);

const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
  const { name, email, password, is_admin } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const passwordHash = await bcrypt.hash(password, 10);
  const adminFlag = is_admin ? 1 : 0; // Convert boolean to integer for SQLite
  
  db.run(
    `INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)`,
    [name, email, passwordHash, adminFlag],
    function(err) {
      if (err) return res.status(400).json({ message: "Email already registered" });
      res.json({ 
        user_id: this.lastID, 
        message: "User registered successfully",
        is_admin: !!is_admin 
      });
    }
  );
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (!row) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) return res.status(403).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { user_id: row.id, is_admin: !!row.is_admin },
      SECRET_KEY,
      { expiresIn: `${TOKEN_EXPIRATION_HOURS}h` }
    );
    
    console.log(`[AUTH REST] ✓ Login: User ${row.id}, Admin: ${!!row.is_admin}`);
    res.json({ token, admin: !!row.is_admin });
  });
});

app.listen(3000, () => console.log("[AUTH REST] Running on port 3000"));