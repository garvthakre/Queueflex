const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const config = require("../config/config");
const authGrpcHandler = require("./authGrpcHandler");

const PROTO_PATH = __dirname + "/../proto/auth.proto";

console.log(`[AUTH GRPC] Starting with secret: ${config.JWT_SECRET_KEY}`);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const server = new grpc.Server();

server.addService(authProto.AuthService.service, {
  VerifyToken: authGrpcHandler.verifyToken,
  RegisterUser: authGrpcHandler.registerUser,
  Login: authGrpcHandler.login,
});

function startGrpcServer() {
  server.bindAsync(
    config.GRPC_PORT,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("[AUTH GRPC] ✗ Failed to start:", err);
        process.exit(1);
      }
      console.log(`[AUTH GRPC] ✓ Running on port ${port}`);
      console.log(`[AUTH GRPC] ✓ Secret key: ${config.JWT_SECRET_KEY}`);
    },
  );
}

module.exports = { startGrpcServer };
