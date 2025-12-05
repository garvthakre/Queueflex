const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');

// HARDCODED SECRET -   just for demo for now gotta fix it in future 
const SECRET_KEY = "my_super_secret_key_12345";
const PROTO_PATH = __dirname + '/proto/auth.proto';

console.log(`[AUTH GRPC] Starting with secret: ${SECRET_KEY}`);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

function verifyToken(call, callback) {
  const token = call.request.token;
  console.log(`\n[AUTH GRPC] ========== NEW REQUEST ==========`);
  console.log(`[AUTH GRPC] Token received: ${token.substring(0, 50)}...`);
  console.log(`[AUTH GRPC] Using secret: ${SECRET_KEY}`);
  
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    console.log(`[AUTH GRPC] ✓✓✓ TOKEN VALID ✓✓✓`);
    console.log(`[AUTH GRPC] Payload:`, payload);
    
    const response = { 
      is_valid: true, 
      user_id: parseInt(payload.user_id), 
      is_admin: Boolean(payload.is_admin)
    };
    
    console.log(`[AUTH GRPC] Sending response:`, response);
    callback(null, response);
    
  } catch (err) {
    console.log(`[AUTH GRPC] ✗✗✗ TOKEN INVALID ✗✗✗`);
    console.log(`[AUTH GRPC] Error: ${err.message}`);
    
    const response = { 
      is_valid: false, 
      user_id: 0, 
      is_admin: false 
    };
    
    console.log(`[AUTH GRPC] Sending response:`, response);
    callback(null, response);
  }
  
  console.log(`[AUTH GRPC] ========== END REQUEST ==========\n`);
}

const server = new grpc.Server();

server.addService(authProto.AuthService.service, {
  VerifyToken: verifyToken,
  RegisterUser: (call, callback) => {
    callback(null, { success: false, message: "Not implemented", user_id: 0 });
  },
  Login: (call, callback) => {
    callback(null, { token: "", admin: false, success: false, message: "Not implemented" });
  }
});

server.bindAsync(
  '0.0.0.0:50051', 
  grpc.ServerCredentials.createInsecure(), 
  (err, port) => {
    if (err) {
      console.error("[AUTH GRPC] ✗ Failed to start:", err);
      process.exit(1);
    }
    console.log(`[AUTH GRPC] ✓ Running on port ${port}`);
    console.log(`[AUTH GRPC] ✓ Secret key: ${SECRET_KEY}`);
  }
);