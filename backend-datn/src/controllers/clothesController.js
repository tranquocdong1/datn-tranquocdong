const mqtt        = require('../services/mqttService');
const TOPICS      = require('../config/mqtt');
const DeviceState = require('../models/DeviceState');

// GET /api/clothes/status
exports.getStatus = async (req, res) => {
  try {
    const state = await DeviceState.findOne({});
    res.json({ clothes: state?.clothes, rain: state?.rain });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/clothes/cmd  — body: { cmd: "IN" | "OUT" | "AUTO" }
exports.sendCmd = (req, res) => {
  const { cmd } = req.body;
  if (!['IN', 'OUT', 'AUTO'].includes(cmd)) {
    return res.status(400).json({ message: 'Invalid command' });
  }
  mqtt.publish(TOPICS.CLOTHES_CMD, cmd);
  res.json({ message: `Clothes ${cmd} sent` });
};