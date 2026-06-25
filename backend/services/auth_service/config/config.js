require("dotenv").config();

const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "my_super_secret_key_12345",
  TOKEN_EXPIRATION_HOURS: parseInt(process.env.TOKEN_EXPIRATION_HOURS || "24"),
  PORT: parseInt(process.env.PORT || "3000"),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  GRPC_PORT: process.env.GRPC_PORT || "0.0.0.0:50051",
  NODE_ENV: process.env.NODE_ENV || "development",
};

console.log(" Configuration loaded");
console.log(`   Environment: ${config.NODE_ENV}`);
console.log(`   Port: ${config.PORT}`);
console.log(`   CORS Origin: ${config.CORS_ORIGIN}`);

if (config.NODE_ENV === "production") {
  if (config.JWT_SECRET_KEY === "my_super_secret_key_12345") {
    console.warn("  WARNING: Using default JWT secret in production!");
  }
  if (config.CORS_ORIGIN === "*") {
    console.warn("  WARNING: CORS is set to allow all origins.");
  }
}

module.exports = config;