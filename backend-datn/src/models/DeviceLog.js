const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
  device:  { type: String, required: true },
  event:   { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  source:  { type: String, default: 'mqtt' },
  createdAt: { type: Date, default: Date.now },
});

deviceLogSchema.index({ device: 1, createdAt: -1 });
deviceLogSchema.index({ event: 1, createdAt: -1 });
deviceLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DeviceLog', deviceLogSchema);