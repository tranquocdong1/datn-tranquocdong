const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  device:    {
    type: String,
    enum: ['door', 'fan', 'living_led', 'bedroom_led', 'clothes'],
    required: true,
  },
  action:    { type: String, required: true }, // OPEN/CLOSE/ON/OFF/AUTO/IN/OUT
  hour:      { type: Number, required: true, min: 0, max: 23 },
  minute:    { type: Number, required: true, min: 0, max: 59 },
  days:      {
    type: [Number], // 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
    required: true,
    validate: (v) => v.length > 0,
  },
  enabled:   { type: Boolean, default: true },
  lastRanAt: { type: Date,    default: null },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);