require("dotenv").config();

const config = {
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "my_super_secret_key_12345",
  TOKEN_EXPIRATION_HOURS: process.env.TOKEN_EXPIRATION_HOURS || 24,
  PORT: process.env.PORT || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3001",
  GRPC_PORT: process.env.GRPC_PORT || "0.0.0.0:50051",
};

module.exports = config;
