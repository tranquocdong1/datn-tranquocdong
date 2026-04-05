const mongoose = require('mongoose');

const deviceStateSchema = new mongoose.Schema({
  door:     { status: { type: String, default: 'closed' } },
  clothes:  { status: { type: String, default: 'out' } },
  rain:     { status: { type: String, default: 'clear' } },
  room: {
    temperature: { type: Number, default: 0 },
    humidity:    { type: Number, default: 0 },
    gas:         { type: Number, default: 0 },
    people:      { type: Number, default: 0 },
    light:       { type: String, default: 'bright' },
    buzzer:      { type: Number, default: 0 },
    fanStatus:   { type: String, default: '0' },
    fanMode:     { type: String, default: 'AUTO' },
  },
  living: {
    ledStatus: { type: String, default: '0' },
    ledMode:   { type: String, default: 'AUTO' },
  },
  bedroom: {
    ledStatus: { type: String, default: '0' },
    ledMode:   { type: String, default: 'AUTO' },
  },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('DeviceState', deviceStateSchema);