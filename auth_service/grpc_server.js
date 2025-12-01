const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret_key";
const PROTO_PATH = __dirname + '/proto/auth.proto';

console.log(`[DEBUG] Using JWT_SECRET_KEY: ${SECRET_KEY}`);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const server = new grpc.Server();

server.addService(authProto.AuthService.service, {
  VerifyToken: (call, callback) => {
    const token = call.request.token;
    console.log(`[DEBUG] Received token verification request`);
    console.log(`[DEBUG] Token (first 50 chars): ${token.substring(0, 50)}...`);
    
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      console.log(`[DEBUG] Token verified successfully`);
      console.log(`[DEBUG] Payload:`, payload);
      
      const response = { 
        is_valid: true, 
        user_id: parseInt(payload.user_id) || 0, 
        is_admin: Boolean(payload.is_admin)
      };
      
      console.log(`[DEBUG] Sending response:`, response);
      callback(null, response);
    } catch (err) {
      console.log(`[DEBUG] Token verification FAILED: ${err.message}`);
      const response = { 
        is_valid: false, 
        user_id: 0, 
        is_admin: false 
      };
      console.log(`[DEBUG] Sending error response:`, response);
      callback(null, response);
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