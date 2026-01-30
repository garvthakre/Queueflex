const authService = require("../services/authService");

class AuthGrpcHandler {
  verifyToken(call, callback) {
    const token = call.request.token;
    console.log(`\n[AUTH GRPC] ========== NEW REQUEST ==========`);
    console.log(`[AUTH GRPC] Token received: ${token.substring(0, 50)}...`);

    const response = authService.verifyToken(token);

    console.log(`[AUTH GRPC] Sending response:`, response);
    callback(null, response);

    console.log(`[AUTH GRPC] ========== END REQUEST ==========\n`);
  }

  registerUser(call, callback) {
    callback(null, { success: false, message: "Not implemented", user_id: 0 });
  }

  login(call, callback) {
    callback(null, {
      token: "",
      admin: false,
      success: false,
      message: "Not implemented",
    });
  }
}

module.exports = new AuthGrpcHandler();
