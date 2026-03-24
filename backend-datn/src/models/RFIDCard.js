const mongoose = require("mongoose");

const rfidCardSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      uppercase: false,
    },
    ownerName: {
      type: String,
      default: "Unknown",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["manual", "learn"],
      default: "manual",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RFIDCard", rfidCardSchema);