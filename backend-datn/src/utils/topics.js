const TOPICS = {
  // =========================
  // ESP32 #1 - Door / Clothes / Rain / RFID
  // =========================
  DOOR_CMD: "binnbom/door/cmd",
  DOOR_STATUS: "binnbom/door/status",
  DOOR_ACCESS: "binnbom/door/access",

  DOOR_UID_ADD: "binnbom/door/uid/add",
  DOOR_UID_REMOVE: "binnbom/door/uid/remove",
  DOOR_UID_LIST: "binnbom/door/uid/list",
  DOOR_UID_SCANNED: "binnbom/door/uid/scanned",
  DOOR_UID_RESPONSE: "binnbom/door/uid/response",
  DOOR_UID_RESULT: "binnbom/door/uid/result",

  CLOTHES_CMD: "binnbom/clothes/cmd",
  CLOTHES_STATUS: "binnbom/clothes/status",
  CLOTHES_WARNING: "binnbom/clothes/warning",

  RAIN_STATUS: "binnbom/rain/status",

  // =========================
  // ESP32 #2 - Room / Fan / Gas / DHT / People / Light
  // (GIỮ NGUYÊN tất cả trừ LED)
  // =========================

  LIVING_LED_CMD: "binnbom/living/led/cmd",
  LIVING_LED_STATUS: "binnbom/living/led/status",

  BEDROOM_LED_CMD: "binnbom/bedroom/led/cmd",
  BEDROOM_LED_STATUS: "binnbom/bedroom/led/status",

  ROOM_FAN_CMD: "binnbom/room/fan/cmd",
  ROOM_FAN_STATUS: "binnbom/room/fan/status",

  ROOM_GAS: "binnbom/room/gas",
  ROOM_BUZZER: "binnbom/room/buzzer",
  ROOM_DHT: "binnbom/room/dht",
  ROOM_PEOPLE: "binnbom/room/people",
  ROOM_LIGHT: "binnbom/room/light",

  // =========================
  // Inter-ESP Alert
  // =========================
  ALERT_BUZZER: "binnbom/alert/buzzer",

  // =========================
  // (Recommended extra topics for future)
  // =========================
  ESP1_STATUS: "binnbom/system/esp1/status",
  ESP2_STATUS: "binnbom/system/esp2/status",

  ledCmd: (room) => `binnbom/${room}/led/cmd`,
  ledStatus: (room) => `binnbom/${room}/led/status`,
};

const LED_ROOMS = ["living", "bedroom"];

const SUBSCRIBE_TOPICS = [
  TOPICS.DOOR_STATUS,
  TOPICS.DOOR_ACCESS,
  TOPICS.DOOR_UID_SCANNED,
  TOPICS.DOOR_UID_RESPONSE,
  TOPICS.DOOR_UID_RESULT,

  TOPICS.CLOTHES_STATUS,
  TOPICS.CLOTHES_WARNING,
  TOPICS.RAIN_STATUS,

  TOPICS.LIVING_LED_STATUS,
  TOPICS.BEDROOM_LED_STATUS,

  TOPICS.ROOM_FAN_STATUS,
  TOPICS.ROOM_GAS,
  TOPICS.ROOM_BUZZER,
  TOPICS.ROOM_DHT,
  TOPICS.ROOM_PEOPLE,
  TOPICS.ROOM_LIGHT,

  TOPICS.ALERT_BUZZER,

  // Optional future
  TOPICS.ESP1_STATUS,
  TOPICS.ESP2_STATUS,
];

module.exports = {
  TOPICS,
  LED_ROOMS,
  SUBSCRIBE_TOPICS,
};