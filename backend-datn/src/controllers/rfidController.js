const { getMQTTClient } = require("../config/mqtt");
const { TOPICS } = require("../utils/topics");
const ControlLog = require("../models/ControlLog");
const RFIDCard = require("../models/RFIDCard");

async function publishCommand(topic, command) {
  const client = getMQTTClient();

  return new Promise((resolve, reject) => {
    client.publish(topic, command, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function normalizeUID(uid) {
  return uid?.trim().toLowerCase();
}

exports.learnCard = async (req, res) => {
  try {
    await publishCommand(TOPICS.DOOR_UID_ADD, "learn");

    await ControlLog.create({
      device: "rfid",
      command: "learn",
      topic: TOPICS.DOOR_UID_ADD,
      source: req.body.source || "web",
    });

    return res.json({
      success: true,
      message: "RFID learn mode activated for 10 seconds",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCard = async (req, res) => {
  try {
    const { uid, ownerName = "Unknown", source = "web" } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: "UID is required" });
    }

    const normalizedUID = normalizeUID(uid);

    await publishCommand(TOPICS.DOOR_UID_ADD, normalizedUID);

    // Lưu local DB để UI quản lý
    const existing = await RFIDCard.findOne({ uid: normalizedUID });
    if (!existing) {
      await RFIDCard.create({
        uid: normalizedUID,
        ownerName,
        source: "manual",
      });
    }

    await ControlLog.create({
      device: "rfid",
      command: normalizedUID,
      topic: TOPICS.DOOR_UID_ADD,
      source,
    });

    return res.json({
      success: true,
      message: "RFID add command sent",
      data: { uid: normalizedUID },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeCard = async (req, res) => {
  try {
    const { uid, source = "web" } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: "UID is required" });
    }

    const normalizedUID = normalizeUID(uid);

    await publishCommand(TOPICS.DOOR_UID_REMOVE, normalizedUID);

    await RFIDCard.findOneAndDelete({ uid: normalizedUID });

    await ControlLog.create({
      device: "rfid",
      command: normalizedUID,
      topic: TOPICS.DOOR_UID_REMOVE,
      source,
    });

    return res.json({
      success: true,
      message: "RFID remove command sent",
      data: { uid: normalizedUID },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncCardList = async (req, res) => {
  try {
    await publishCommand(TOPICS.DOOR_UID_LIST, "get");

    await ControlLog.create({
      device: "rfid",
      command: "get",
      topic: TOPICS.DOOR_UID_LIST,
      source: req.body?.source || "web",
    });

    return res.json({
      success: true,
      message: "Requested RFID list from ESP32",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const cards = await RFIDCard.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: cards,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};