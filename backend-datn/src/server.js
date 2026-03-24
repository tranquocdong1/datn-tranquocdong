const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const { PORT, CORS_ORIGIN } = require("./config/env");
const { connectMQTT } = require("./config/mqtt");
const { setupMQTTHandlers } = require("./services/mqttHandler");
const { setIO } = require("./services/socketService");

async function startServer() {
  try {
    await connectDB();

    const mqttClient = connectMQTT();
    setupMQTTHandlers(mqttClient);

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
        methods: ["GET", "POST"],
      },
    });

    setIO(io);

    io.on("connection", (socket) => {
      console.log("🔌 Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();