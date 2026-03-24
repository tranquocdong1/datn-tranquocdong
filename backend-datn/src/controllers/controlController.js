const { getMQTTClient } = require("../config/mqtt");
const { TOPICS, LED_ROOMS } = require("../utils/topics");
const ControlLog = require("../models/ControlLog");
const { updateState } = require("../services/stateService");

async function publishCommand(topic, command) {
  const client = getMQTTClient();

  return new Promise((resolve, reject) => {
    client.publish(topic, command, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// =========================
// DOOR
// =========================
exports.openDoor = async (req, res) => {
  try {
    await publishCommand(TOPICS.DOOR_CMD, "OPEN");

    await ControlLog.create({
      device: "door",
      command: "OPEN",
      topic: TOPICS.DOOR_CMD,
      source: req.body.source || "web",
    });

    return res.json({ success: true, message: "Door OPEN command sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.closeDoor = async (req, res) => {
  try {
    await publishCommand(TOPICS.DOOR_CMD, "CLOSE");

    await ControlLog.create({
      device: "door",
      command: "CLOSE",
      topic: TOPICS.DOOR_CMD,
      source: req.body.source || "web",
    });

    return res.json({ success: true, message: "Door CLOSE command sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// CLOTHES
// =========================
exports.clothesIn = async (req, res) => {
  try {
    await publishCommand(TOPICS.CLOTHES_CMD, "IN");

    await updateState({ clothesMode: "manual" });

    await ControlLog.create({
      device: "clothes",
      command: "IN",
      topic: TOPICS.CLOTHES_CMD,
      source: req.body.source || "web",
    });

    return res.json({ success: true, message: "Clothes rack IN command sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clothesOut = async (req, res) => {
  try {
    await publishCommand(TOPICS.CLOTHES_CMD, "OUT");

    await updateState({ clothesMode: "manual" });

    await ControlLog.create({
      device: "clothes",
      command: "OUT",
      topic: TOPICS.CLOTHES_CMD,
      source: req.body.source || "web",
    });

    return res.json({ success: true, message: "Clothes rack OUT command sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clothesAuto = async (req, res) => {
  try {
    await publishCommand(TOPICS.CLOTHES_CMD, "AUTO");

    await updateState({ clothesMode: "auto" });

    await ControlLog.create({
      device: "clothes",
      command: "AUTO",
      topic: TOPICS.CLOTHES_CMD,
      source: req.body.source || "web",
    });

    return res.json({ success: true, message: "Clothes rack AUTO command sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// LED (living / bedroom)
// =========================
exports.controlLED = async (req, res) => {
  try {
    const { room } = req.params;
    const { mode, source = "web" } = req.body;
    const allowed = ["ON", "OFF", "AUTO"];

    if (!LED_ROOMS.includes(room)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room. Allowed: living, bedroom",
      });
    }

    if (!allowed.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid LED mode",
      });
    }

    let topic = "";
    let stateUpdate = {};

    if (room === "living") {
      topic = TOPICS.LIVING_LED_CMD;
      stateUpdate = {
        livingLedMode: mode === "AUTO" ? "auto" : "manual",
      };
    } else if (room === "bedroom") {
      topic = TOPICS.BEDROOM_LED_CMD;
      stateUpdate = {
        bedroomLedMode: mode === "AUTO" ? "auto" : "manual",
      };
    }

    await publishCommand(topic, mode);

    await updateState(stateUpdate);

    await ControlLog.create({
      device: `led_${room}`,
      command: mode,
      topic,
      source,
    });

    return res.json({
      success: true,
      message: `${room} LED ${mode} command sent`,
      data: {
        room,
        topic,
        mode,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// FAN
// =========================
exports.controlFan = async (req, res) => {
  try {
    const { mode, source = "web" } = req.body;
    const allowed = ["ON", "OFF", "AUTO"];

    if (!allowed.includes(mode)) {
      return res.status(400).json({ success: false, message: "Invalid FAN mode" });
    }

    await publishCommand(TOPICS.ROOM_FAN_CMD, mode);

    await updateState({
      fanMode: mode === "AUTO" ? "auto" : "manual",
    });

    await ControlLog.create({
      device: "fan",
      command: mode,
      topic: TOPICS.ROOM_FAN_CMD,
      source,
    });

    return res.json({ success: true, message: `FAN ${mode} command sent` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// ALERT BUZZER OFF
// =========================
exports.turnOffAlertBuzzer = async (req, res) => {
  try {
    await publishCommand(TOPICS.ALERT_BUZZER, "OFF");

    await ControlLog.create({
      device: "buzzer",
      command: "OFF",
      topic: TOPICS.ALERT_BUZZER,
      source: req.body.source || "web",
    });

    return res.json({ success: true, message: "Alert buzzer OFF command sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};