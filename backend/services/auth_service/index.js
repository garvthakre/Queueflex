const app = require("./app");
const { startGrpcServer } = require("./grpc/grpcServer");
const { initDB } = require("./db/db");
const config = require("./config/config");

const start = async () => {
  await initDB();

  app.listen(config.PORT, () =>
    console.log(`[AUTH REST] Running on port ${config.PORT}`)
  );

  startGrpcServer();
};

start();