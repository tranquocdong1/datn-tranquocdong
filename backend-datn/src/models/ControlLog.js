const mongoose = require("mongoose");

const controlLogSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      enum: ["door", "clothes", "led_living", "led_bedroom", "fan", "buzzer", "rfid"],
      required: true,
    },
    command: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["web", "mobile", "system", "postman"],
      default: "web",
    },
    result: {
      type: String,
      enum: ["sent", "success", "failed"],
      default: "sent",
    },
    note: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ControlLog", controlLogSchema);