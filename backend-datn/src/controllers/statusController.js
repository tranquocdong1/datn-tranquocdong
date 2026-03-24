const DeviceState = require("../models/DeviceState");
const SensorLog = require("../models/SensorLog");

exports.getCurrentStatus = async (req, res) => {
  try {
    let state = await DeviceState.findOne();
    if (!state) state = await DeviceState.create({});
    return res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLatestSensors = async (req, res) => {
  try {
    const latest = await SensorLog.find()
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      data: latest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};