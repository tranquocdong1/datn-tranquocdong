const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/door", require("./routes/door"));
app.use("/api/room", require("./routes/room"));
app.use("/api/clothes", require("./routes/clothes"));
app.use("/api/stats", require("./routes/stats"));
app.use('/api/schedules', require('./routes/schedules'));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

module.exports = app;
