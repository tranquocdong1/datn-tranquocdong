const SensorLog = require("../models/SensorLog");
const ControlLog = require("../models/ControlLog");
const AccessLog = require("../models/AccessLog");

exports.getSensorLogs = async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;

    const filter = {};
    if (type) filter.sensorType = type;

    const logs = await SensorLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getControlLogs = async (req, res) => {
  try {
    const { device, limit = 50 } = req.query;

    const filter = {};
    if (device) filter.device = device;

    const logs = await ControlLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAccessLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await AccessLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};