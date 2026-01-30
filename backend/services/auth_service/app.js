const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const authRoutes = require("./routes/authRoutes");

console.log(`[AUTH REST] JWT Secret: ${config.JWT_SECRET_KEY}`);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

// Routes
app.use("/", authRoutes);

module.exports = app;
