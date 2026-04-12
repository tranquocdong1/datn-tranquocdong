const mqtt        = require('../services/mqttService');
const TOPICS      = require('../config/mqtt');
const DeviceState = require('../models/DeviceState');
const DeviceLog   = require('../models/DeviceLog');

// GET /api/room/status
exports.getStatus = async (req, res) => {
  try {
    const state = await DeviceState.findOne({});
    res.json({ room: state?.room, living: state?.living, bedroom: state?.bedroom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/room/fan  — body: { cmd: "ON" | "OFF" | "AUTO" }
exports.fanCmd = (req, res) => {
  const { cmd } = req.body;
  if (!['ON', 'OFF', 'AUTO'].includes(cmd)) {
    return res.status(400).json({ message: 'Invalid command' });
  }
  mqtt.publish(TOPICS.ROOM_FAN_CMD, cmd);
  res.json({ message: `Fan ${cmd} sent` });
};

// POST /api/room/living/led  — body: { cmd: "ON" | "OFF" | "AUTO" }
exports.livingLedCmd = (req, res) => {
  const { cmd } = req.body;
  if (!['ON', 'OFF', 'AUTO'].includes(cmd)) {
    return res.status(400).json({ message: 'Invalid command' });
  }
  mqtt.publish(TOPICS.LIVING_LED_CMD, cmd);
  res.json({ message: `Living LED ${cmd} sent` });
};

// POST /api/room/bedroom/led  — body: { cmd: "ON" | "OFF" | "AUTO" }
exports.bedroomLedCmd = (req, res) => {
  const { cmd } = req.body;
  if (!['ON', 'OFF', 'AUTO'].includes(cmd)) {
    return res.status(400).json({ message: 'Invalid command' });
  }
  mqtt.publish(TOPICS.BEDROOM_LED_CMD, cmd);
  res.json({ message: `Bedroom LED ${cmd} sent` });
};

// POST /api/room/alert  — body: { cmd: "INTRUDER" | "OFF" }
exports.alertCmd = (req, res) => {
  const { cmd } = req.body;
  mqtt.publish(TOPICS.ALERT_BUZZER, cmd);
  res.json({ message: `Alert ${cmd} sent` });
};

// GET /api/room/logs?limit=50
exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs  = await DeviceLog.find({ device: { $in: ['room', 'security'] } })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};