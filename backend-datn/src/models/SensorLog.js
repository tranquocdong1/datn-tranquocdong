const mongoose = require("mongoose");

const sensorLogSchema = new mongoose.Schema(
  {
    sensorType: {
      type: String,
      enum: ["dht", "gas", "rain", "people", "light", "buzzer"],
      required: true,
    },
    source: {
      type: String,
      enum: ["esp1", "esp2", "system"],
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SensorLog", sensorLogSchema);