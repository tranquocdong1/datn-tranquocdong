const mqtt      = require('../services/mqttService');
const TOPICS    = require('../config/mqtt');
const DeviceLog = require('../models/DeviceLog');
const DeviceState = require('../models/DeviceState');

// GET /api/door/status
exports.getStatus = async (req, res) => {
  try {
    const state = await DeviceState.findOne({});
    res.json({ door: state?.door, rain: state?.rain });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/door/cmd  — body: { cmd: "OPEN" | "CLOSE" }
exports.sendCmd = (req, res) => {
  const { cmd } = req.body;
  if (!['OPEN', 'CLOSE'].includes(cmd)) {
    return res.status(400).json({ message: 'Invalid command' });
  }
  mqtt.publish(TOPICS.DOOR_CMD, cmd);
  res.json({ message: `Command ${cmd} sent` });
};

// POST /api/door/uid/add  — body: { uid: "83:15:ce:06" } | { mode: "learn" }
exports.addUID = (req, res) => {
  const { uid, mode } = req.body;
  if (mode === 'learn') {
    mqtt.publish(TOPICS.DOOR_UID_ADD, 'learn');
    return res.json({ message: 'Learn mode activated' });
  }
  if (!uid) return res.status(400).json({ message: 'UID required' });
  mqtt.publish(TOPICS.DOOR_UID_ADD, uid);
  res.json({ message: `Add UID ${uid} sent` });
};

// DELETE /api/door/uid  — body: { uid: "83:15:ce:06" }
exports.removeUID = (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ message: 'UID required' });
  mqtt.publish(TOPICS.DOOR_UID_REMOVE, uid);
  res.json({ message: `Remove UID ${uid} sent` });
};

// GET /api/door/uid/list
exports.listUID = (req, res) => {
  mqtt.publish(TOPICS.DOOR_UID_LIST, '');
  res.json({ message: 'UID list requested' });
};

// GET /api/door/logs?limit=50
exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs  = await DeviceLog.find({ device: 'door' })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};