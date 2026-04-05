const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
  device:    { type: String, required: true }, // 'door', 'room', 'clothes'...
  event:     { type: String, required: true }, // 'access_granted', 'gas_detected'...
  payload:   { type: mongoose.Schema.Types.Mixed },
  source:    { type: String, default: 'mqtt' }, // 'mqtt' | 'api' | 'user'
  createdAt: { type: Date, default: Date.now },
});

deviceLogSchema.index({ device: 1, createdAt: -1 });

module.exports = mongoose.model('DeviceLog', deviceLogSchema);