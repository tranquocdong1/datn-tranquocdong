const express = require("express");
const cors = require("cors");
const { CORS_ORIGIN } = require("./config/env");

const statusRoutes = require("./routes/statusRoutes");
const controlRoutes = require("./routes/controlRoutes");
const rfidRoutes = require("./routes/rfidRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors({
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Binnbom Smart Home Backend is running 🚀",
  });
});

app.use("/api/status", statusRoutes);
app.use("/api/control", controlRoutes);
app.use("/api/rfid", rfidRoutes);
app.use("/api/logs", logRoutes);

module.exports = app;