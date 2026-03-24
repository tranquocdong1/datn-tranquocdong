require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  MQTT_URL: process.env.MQTT_URL,
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD,
  MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID || "backend_binnbom_server",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};