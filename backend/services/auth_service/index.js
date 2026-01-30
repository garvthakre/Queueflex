const app = require("./app");
const { startGrpcServer } = require("./grpc/grpcServer");
const config = require("./config/config");

// Start REST API server
app.listen(config.PORT, () =>
  console.log(`[AUTH REST] Running on port ${config.PORT}`),
);

// Start gRPC server
startGrpcServer();
