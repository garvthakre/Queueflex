const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret_key";
const PROTO_PATH = __dirname + '/proto/auth.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const server = new grpc.Server();

server.addService(authProto.AuthService.service, {
  VerifyToken: (call, callback) => {
    const token = call.request.token;
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      callback(null, { is_valid: true, user_id: payload.user_id.toString(), is_admin: payload.is_admin });
    } catch (err) {
      callback(null, { is_valid: false, user_id: "-1", is_admin: false });
    }
  }
});

// Use bindAsync instead of bind
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error("gRPC server failed to bind:", err);
    return;
  }
  console.log(`Auth gRPC running on port ${port}`);
  server.start();
});
