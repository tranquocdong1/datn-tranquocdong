const TOPICS = {
  // ESP32 #1 — Cửa + Giàn phơi
  DOOR_STATUS:     'binnbom/door/status',
  DOOR_CMD:        'binnbom/door/cmd',
  DOOR_ACCESS:     'binnbom/door/access',
  DOOR_UID_SCANNED:'binnbom/door/uid/scanned',
  DOOR_UID_ADD:    'binnbom/door/uid/add',
  DOOR_UID_REMOVE: 'binnbom/door/uid/remove',
  DOOR_UID_LIST:   'binnbom/door/uid/list',
  DOOR_UID_RESULT: 'binnbom/door/uid/result',
  DOOR_UID_RESPONSE:'binnbom/door/uid/response',

  CLOTHES_STATUS:  'binnbom/clothes/status',
  CLOTHES_CMD:     'binnbom/clothes/cmd',
  CLOTHES_WARNING: 'binnbom/clothes/warning',

  RAIN_STATUS:     'binnbom/rain/status',

  // ESP32 #2 — Phòng
  ROOM_DHT:        'binnbom/room/dht',
  ROOM_GAS:        'binnbom/room/gas',
  ROOM_PEOPLE:     'binnbom/room/people',
  ROOM_LIGHT:      'binnbom/room/light',
  ROOM_BUZZER:     'binnbom/room/buzzer',

  LIVING_LED_STATUS: 'binnbom/living/led/status',
  LIVING_LED_CMD:    'binnbom/living/led/cmd',
  BEDROOM_LED_STATUS:'binnbom/bedroom/led/status',
  BEDROOM_LED_CMD:   'binnbom/bedroom/led/cmd',

  ROOM_FAN_STATUS: 'binnbom/room/fan/status',
  ROOM_FAN_CMD:    'binnbom/room/fan/cmd',

  ALERT_BUZZER:    'binnbom/alert/buzzer',
};

module.exports = TOPICS;