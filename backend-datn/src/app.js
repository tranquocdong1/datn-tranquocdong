const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ Thêm dòng này — Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes (giữ nguyên như cũ)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/door", require("./routes/door"));
app.use("/api/room", require("./routes/room"));
app.use("/api/clothes", require("./routes/clothes"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/schedules", require("./routes/schedules"));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

module.exports = app;