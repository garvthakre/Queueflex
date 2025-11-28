import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  findUserByEmail(email, async (err, user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    createUser(name, email, hashedPassword, role, (err) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      console.log("user");
      return res.status(201).json({ msg: "User registered successfully" });
      
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, async (err, user) => {
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};
