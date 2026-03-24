const mqtt = require("mqtt");
const {
  MQTT_URL,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_CLIENT_ID,
} = require("./env");

let mqttClient = null;

function connectMQTT() {
  mqttClient = mqtt.connect(MQTT_URL, {
    clientId: MQTT_CLIENT_ID,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 3000,
    clean: true,
  });

  mqttClient.on("connect", () => {
    console.log("✅ MQTT connected");
  });

  mqttClient.on("reconnect", () => {
    console.log("🔄 MQTT reconnecting...");
  });

  mqttClient.on("error", (err) => {
    console.error("❌ MQTT error:", err.message);
  });

  mqttClient.on("close", () => {
    console.log("⚠️ MQTT disconnected");
  });

  return mqttClient;
}

function getMQTTClient() {
  if (!mqttClient) {
    throw new Error("MQTT client not initialized");
  }
  return mqttClient;
}

module.exports = {
  connectMQTT,
  getMQTTClient,
};