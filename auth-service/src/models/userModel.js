import db from "../db/database.js";

export const createUser = (name, email, hashedPassword, role, callback) => {
  db.run(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    [name, email, hashedPassword, role],
    callback
  );
};

export const findUserByEmail = (email, callback) => {
  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    callback
  );
};
