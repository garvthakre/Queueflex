const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret_key";
const TOKEN_EXPIRATION_HOURS = process.env.TOKEN_EXPIRATION_HOURS || 24;

const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const passwordHash = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
    [name, email, passwordHash],
    function(err) {
      if (err) return res.status(400).json({ message: "Email already registered" });
      res.json({ user_id: this.lastID, message: "User registered successfully" });
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
    res.json({ token, admin: !!row.is_admin });
  });
});

app.listen(3000, () => console.log("Auth REST running on port 3000"));
