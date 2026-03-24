const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      default: null,
    },
    result: {
      type: String,
      enum: ["granted", "denied", "scanned", "added", "removed", "failed", "timeout", "waiting_card", "already_exists"],
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    topic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessLog", accessLogSchema);