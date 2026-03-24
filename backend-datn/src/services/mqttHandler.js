const { SUBSCRIBE_TOPICS, TOPICS } = require("../utils/topics");
const SensorLog = require("../models/SensorLog");
const AccessLog = require("../models/AccessLog");
const RFIDCard = require("../models/RFIDCard");
const { updateState } = require("./stateService");
const { emitRealtime } = require("./socketService");

function normalizeUID(uid) {
    return uid?.trim().toLowerCase();
}

async function handleLivingLedStatus(topic, payload) {
    const value = Number(payload);

    await updateState({ livingLedStatus: value });
    emitRealtime("living_led_status", { topic, value });
}

async function handleBedroomLedStatus(topic, payload) {
    const value = Number(payload);

    await updateState({ bedroomLedStatus: value });
    emitRealtime("bedroom_led_status", { topic, value });
}

async function handleMessage(topic, message) {
    const payload = message.toString();
    console.log(`📩 MQTT [${topic}] => ${payload}`);

    try {
        switch (topic) {
            // =========================
            // DOOR
            // =========================
            case TOPICS.DOOR_STATUS:
                await updateState({ doorStatus: payload });
                emitRealtime("door_status", { topic, value: payload });
                break;

            case TOPICS.DOOR_ACCESS:
                await updateState({ lastDoorAccess: payload });
                await AccessLog.create({
                    uid: null,
                    result: payload,
                    note: "Door access result",
                    topic,
                });
                emitRealtime("door_access", { topic, value: payload });
                break;

            case TOPICS.DOOR_UID_SCANNED:
                await updateState({ lastScannedUID: payload });
                await AccessLog.create({
                    uid: normalizeUID(payload),
                    result: "scanned",
                    note: "Card scanned",
                    topic,
                });
                emitRealtime("rfid_scanned", { topic, value: payload });
                break;

            case TOPICS.DOOR_UID_RESPONSE:
                await updateState({ rfidListRaw: payload });

                // Đồng bộ sơ bộ danh sách RFID từ ESP -> DB
                if (payload !== "empty") {
                    const uids = payload.split(",").map((u) => normalizeUID(u));
                    for (const uid of uids) {
                        const existing = await RFIDCard.findOne({ uid });
                        if (!existing) {
                            await RFIDCard.create({
                                uid,
                                ownerName: "Synced from ESP",
                                source: "manual",
                            });
                        }
                    }
                }

                emitRealtime("rfid_list", { topic, value: payload });
                break;

            case TOPICS.DOOR_UID_RESULT:
                await AccessLog.create({
                    uid: null,
                    result: payload,
                    note: "RFID management result",
                    topic,
                });
                emitRealtime("rfid_result", { topic, value: payload });
                break;

            // =========================
            // CLOTHES / RAIN
            // =========================
            case TOPICS.CLOTHES_STATUS:
                await updateState({ clothesStatus: payload });
                emitRealtime("clothes_status", { topic, value: payload });
                break;

            case TOPICS.CLOTHES_WARNING:
                await updateState({ clothesWarning: payload });
                emitRealtime("clothes_warning", { topic, value: payload });
                break;

            case TOPICS.RAIN_STATUS:
                await updateState({ rainStatus: payload });
                await SensorLog.create({
                    sensorType: "rain",
                    source: "esp1",
                    value: payload,
                    topic,
                });
                emitRealtime("rain_status", { topic, value: payload });
                break;

            // =========================
            // ROOM
            // =========================
            case TOPICS.LIVING_LED_STATUS:
                await handleLivingLedStatus(topic, payload);
                break;

            case TOPICS.BEDROOM_LED_STATUS:
                await handleBedroomLedStatus(topic, payload);
                break;

            case TOPICS.ROOM_FAN_STATUS:
                await updateState({ fanStatus: Number(payload) });
                emitRealtime("fan_status", { topic, value: Number(payload) });
                break;

            case TOPICS.ROOM_GAS:
                await updateState({ gasStatus: Number(payload) });
                await SensorLog.create({
                    sensorType: "gas",
                    source: "esp2",
                    value: Number(payload),
                    topic,
                });
                emitRealtime("gas_status", { topic, value: Number(payload) });
                break;

            case TOPICS.ROOM_BUZZER:
                await updateState({ buzzerStatus: Number(payload) });
                await SensorLog.create({
                    sensorType: "buzzer",
                    source: "esp2",
                    value: Number(payload),
                    topic,
                });
                emitRealtime("buzzer_status", { topic, value: Number(payload) });
                break;

            case TOPICS.ROOM_DHT: {
                let data = null;
                try {
                    data = JSON.parse(payload);
                } catch {
                    console.warn("⚠️ Invalid DHT JSON:", payload);
                    break;
                }

                await updateState({
                    temperature: data.temp,
                    humidity: data.hum,
                });

                await SensorLog.create({
                    sensorType: "dht",
                    source: "esp2",
                    value: data,
                    topic,
                });

                emitRealtime("dht", { topic, value: data });
                break;
            }

            case TOPICS.ROOM_PEOPLE:
                await updateState({ peopleCount: Number(payload) });
                await SensorLog.create({
                    sensorType: "people",
                    source: "esp2",
                    value: Number(payload),
                    topic,
                });
                emitRealtime("people_count", { topic, value: Number(payload) });
                break;

            case TOPICS.ROOM_LIGHT:
                await updateState({ lightStatus: payload });
                await SensorLog.create({
                    sensorType: "light",
                    source: "esp2",
                    value: payload,
                    topic,
                });
                emitRealtime("light_status", { topic, value: payload });
                break;

            // =========================
            // ALERT
            // =========================
            case TOPICS.ALERT_BUZZER:
                await updateState({ lastAlert: payload });
                emitRealtime("alert_buzzer", { topic, value: payload });
                break;

            // =========================
            // SYSTEM (future)
            // =========================
            case TOPICS.ESP1_STATUS:
                await updateState({ esp1Online: payload === "online" });
                emitRealtime("esp1_status", { topic, value: payload });
                break;

            case TOPICS.ESP2_STATUS:
                await updateState({ esp2Online: payload === "online" });
                emitRealtime("esp2_status", { topic, value: payload });
                break;

            default:
                console.log("ℹ️ Unhandled topic:", topic);
                break;
        }
    } catch (error) {
        console.error(`❌ Error handling topic ${topic}:`, error.message);
    }
}

function setupMQTTHandlers(mqttClient) {
    mqttClient.on("connect", () => {
        mqttClient.subscribe(SUBSCRIBE_TOPICS, (err) => {
            if (err) {
                console.error("❌ Subscribe failed:", err.message);
            } else {
                console.log("✅ Subscribed topics:");
                SUBSCRIBE_TOPICS.forEach((t) => console.log("   -", t));
            }
        });
    });

    mqttClient.on("message", async (topic, message) => {
        await handleMessage(topic, message);
    });
}

module.exports = {
    setupMQTTHandlers,
};