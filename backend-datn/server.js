require('dotenv').config();
const http          = require('http');
const app           = require('./src/app');
const connectDB     = require('./src/config/db');
const mqttService   = require('./src/services/mqttService');
const socketService = require('./src/services/socketService');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  const server = http.createServer(app);

  // Khởi tạo Socket.IO (truyền server vào)
  const io = socketService.init(server);

  // Khởi tạo MQTT (truyền io vào để emit realtime)
  mqttService.init(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();