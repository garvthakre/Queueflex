 
require("dotenv").config();

const config = {
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "my_super_secret_key_12345",
  TOKEN_EXPIRATION_HOURS: parseInt(process.env.TOKEN_EXPIRATION_HOURS || "24"),
  PORT: parseInt(process.env.PORT || "3000"),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  GRPC_PORT: process.env.GRPC_PORT || "0.0.0.0:50051",
  NODE_ENV: process.env.NODE_ENV || "development",
};

// Log configuration (without sensitive data)
console.log(" Configuration loaded");
console.log(`   Environment: ${config.NODE_ENV}`);
console.log(`   Port: ${config.PORT}`);
console.log(`   CORS Origin: ${config.CORS_ORIGIN}`);

// Warning in production
if (config.NODE_ENV === 'production') {
  if (config.JWT_SECRET_KEY === 'my_super_secret_key_12345') {
    console.warn('  WARNING: Using default JWT secret in production! Please set JWT_SECRET_KEY environment variable.');
  }
  if (config.CORS_ORIGIN === '*') {
    console.warn('  WARNING: CORS is set to allow all origins. Consider restricting in production.');
  }
}

module.exports = config;