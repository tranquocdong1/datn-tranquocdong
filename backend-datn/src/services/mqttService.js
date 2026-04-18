const mqtt = require("mqtt");
const TOPICS = require("../config/mqtt");
const DeviceState = require("../models/DeviceState");
const DeviceLog = require("../models/DeviceLog");
const socket = require("./socketService");
const { sendEmail } = require("./emailService");

let client;
let lastScannedUID = "";

// ─── Upsert trạng thái thiết bị ───────────────────────────────────────────
const updateState = async (update) => {
  await DeviceState.findOneAndUpdate(
    {},
    { ...update, updatedAt: new Date() },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

// ─── Ghi log ──────────────────────────────────────────────────────────────
const saveLog = (device, event, payload) => {
  DeviceLog.create({ device, event, payload }).catch(console.error);
};

// ─── Template email cảnh báo ──────────────────────────────────────────────
const alertEmail = ({ icon, title, rows }) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
              background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
    <div style="text-align:center;margin-bottom:24px">
      <h2 style="margin:0;color:#1e293b">🏠 Smart Home</h2>
      <p style="color:#64748b;font-size:13px;margin-top:6px">${icon} ${title}</p>
    </div>
    <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
      ${rows
        .map(
          ([label, value, highlight]) => `
        <tr${highlight ? ' style="background:#fef2f2"' : ""}>
          <td style="padding:8px 12px;color:#64748b">${label}</td>
          <td style="padding:8px 12px;font-weight:700;text-align:right;
                     ${highlight ? "color:#ef4444" : ""}">${value}</td>
        </tr>
      `,
        )
        .join("")}
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
    <p style="color:#94a3b8;font-size:11px;text-align:center">
      Email tự động từ hệ thống Smart Home. Vui lòng không trả lời.
    </p>
  </div>
`;

// ─── Xử lý từng topic ─────────────────────────────────────────────────────
const handleMessage = async (topic, message) => {
  const msg = message.toString().trim();

  switch (topic) {
    case TOPICS.DOOR_STATUS:
      await updateState({ "door.status": msg });
      socket.emit("door:status", { status: msg });
      break;

    // ── Cửa ──────────────────────────────────────────────────────────────
    case TOPICS.DOOR_ACCESS: {
      const granted = msg === "granted";
      saveLog("door", granted ? "access_granted" : "access_denied", {
        result: msg,
      });
      socket.emit("door:access", { result: msg });

      if (granted) {
        sendEmail({
          subject: "🚪 Cửa chính đã được mở",
          html: alertEmail({
            icon: "✅",
            title: "Truy cập thành công",
            rows: [
              ["Trạng thái", "Đã mở cửa"],
              ["UID thẻ", lastScannedUID || "unknown"],
              ["Thời gian", new Date().toLocaleString("vi-VN")],
            ],
          }),
        }).catch(console.error);
      } else {
        sendEmail({
          subject: "🚫 Thẻ bị từ chối – Smart Home",
          html: alertEmail({
            icon: "❌",
            title: "Truy cập bị từ chối",
            rows: [
              ["Trạng thái", "Từ chối", true],
              ["UID thẻ", lastScannedUID || "unknown", true],
              ["Thời gian", new Date().toLocaleString("vi-VN")],
            ],
          }),
        }).catch(console.error);
      }
      break;
    }

    case TOPICS.DOOR_UID_SCANNED:
      lastScannedUID = msg;
      saveLog("door", "uid_scanned", { uid: msg });
      socket.emit("door:uid_scanned", { uid: msg });
      break;

    case TOPICS.DOOR_UID_RESULT:
      socket.emit("door:uid_result", { result: msg });
      break;

    case TOPICS.DOOR_UID_RESPONSE:
      socket.emit("door:uid_response", { uids: msg });
      break;

    // ── Giàn phơi ────────────────────────────────────────────────────────
    case TOPICS.CLOTHES_STATUS:
      await updateState({ "clothes.status": msg });
      socket.emit("clothes:status", { status: msg });
      break;

    case TOPICS.CLOTHES_WARNING:
      socket.emit("clothes:warning", { reason: msg });
      break;

    // ── Mưa ──────────────────────────────────────────────────────────────
    case TOPICS.RAIN_STATUS:
      await updateState({ "rain.status": msg });
      socket.emit("rain:status", { status: msg });
      if (msg === "raining") {
        saveLog("rain", "rain_detected", {});
        sendEmail({
          subject: "🌧️ Cảnh báo: Trời đang mưa!",
          html: alertEmail({
            icon: "🌧️",
            title: "Phát hiện mưa",
            rows: [
              ["Trạng thái", "Đang mưa", true],
              ["Thời gian", new Date().toLocaleString("vi-VN")],
              ["Lưu ý", "Giàn phơi sẽ tự động thu vào"],
            ],
          }),
        }).catch(console.error);
      } else {
        sendEmail({
          subject: "☀️ Thông báo: Trời đã tạnh mưa",
          html: alertEmail({
            icon: "☀️",
            title: "Mưa đã dừng",
            rows: [
              ["Trạng thái", "Tạnh mưa"],
              ["Thời gian", new Date().toLocaleString("vi-VN")],
            ],
          }),
        }).catch(console.error);
      }
      break;

    // ── DHT11 ─────────────────────────────────────────────────────────────
    case TOPICS.ROOM_DHT: {
      try {
        const { temp, hum } = JSON.parse(msg);
        await updateState({ "room.temperature": temp, "room.humidity": hum });
        socket.emit("room:dht", { temp, hum });
        saveLog("room", "dht_record", { temp, hum });
        if (temp >= 35) {
          saveLog("room", "high_temperature", { temp, hum });
          sendEmail({
            subject: `🌡️ Cảnh báo nhiệt độ cao: ${temp}°C`,
            html: alertEmail({
              icon: "🌡️",
              title: "Nhiệt độ cao bất thường",
              rows: [
                ["Nhiệt độ", `${temp} °C`, true],
                ["Độ ẩm", `${hum} %`],
                ["Thời gian", new Date().toLocaleString("vi-VN")],
                ["Lưu ý", "Vui lòng kiểm tra và bật điều hòa/quạt"],
              ],
            }),
          }).catch(console.error);
        }
      } catch (_) {}
      break;
    }

    // ── Khí gas ───────────────────────────────────────────────────────────
    case TOPICS.ROOM_GAS: {
      const gasVal = parseInt(msg);
      await updateState({ "room.gas": gasVal });
      socket.emit("room:gas", { gas: gasVal });
      if (gasVal === 1) {
        saveLog("room", "gas_detected", { value: gasVal });
        sendEmail({
          subject: "💨 KHẨN: Phát hiện khí gas rò rỉ!",
          html: alertEmail({
            icon: "⚠️",
            title: "Phát hiện khí gas rò rỉ",
            rows: [
              ["Trạng thái", "Nguy hiểm – Gas rò rỉ", true],
              ["Thời gian", new Date().toLocaleString("vi-VN"), true],
              ["Hành động", "Tắt nguồn gas và thông gió ngay!", true],
            ],
          }),
        }).catch(console.error);
      }
      break;
    }

    // ── Đếm người ─────────────────────────────────────────────────────────
    case TOPICS.ROOM_PEOPLE: {
      const count = parseInt(msg);
      await updateState({ "room.people": count });
      socket.emit("room:people", { count });
      break;
    }

    // ── Ánh sáng ──────────────────────────────────────────────────────────
    case TOPICS.ROOM_LIGHT:
      await updateState({ "room.light": msg });
      socket.emit("room:light", { light: msg });
      break;

    // ── Buzzer ────────────────────────────────────────────────────────────
    case TOPICS.ROOM_BUZZER: {
      const buzzerVal = parseInt(msg);
      await updateState({ "room.buzzer": buzzerVal });
      socket.emit("room:buzzer", { buzzer: buzzerVal });
      if (buzzerVal === 1) saveLog("room", "buzzer_on", {});
      break;
    }

    // ── LED phòng khách ───────────────────────────────────────────────────
    case TOPICS.LIVING_LED_STATUS:
      await updateState({ "living.ledStatus": msg });
      socket.emit("living:led_status", { status: msg });
      break;

    // ── LED phòng ngủ ─────────────────────────────────────────────────────
    case TOPICS.BEDROOM_LED_STATUS:
      await updateState({ "bedroom.ledStatus": msg });
      socket.emit("bedroom:led_status", { status: msg });
      break;

    // ── Quạt ──────────────────────────────────────────────────────────────
    case TOPICS.ROOM_FAN_STATUS:
      await updateState({ "room.fanStatus": msg });
      socket.emit("room:fan_status", { status: msg });
      break;

    // ── Cảnh báo xâm nhập ─────────────────────────────────────────────────
    case TOPICS.ALERT_BUZZER:
      if (msg === "INTRUDER") {
        saveLog("security", "intruder_alert", {});
        socket.emit("alert:intruder", {});
        sendEmail({
          subject: "🚨 KHẨN CẤP: Phát hiện xâm nhập!",
          html: alertEmail({
            icon: "🚨",
            title: "Cảnh báo xâm nhập",
            rows: [
              ["Trạng thái", "PHÁT HIỆN XÂM NHẬP", true],
              ["Thời gian", new Date().toLocaleString("vi-VN"), true],
              [
                "Hành động",
                "Kiểm tra camera và liên hệ cơ quan chức năng nếu cần",
                true,
              ],
            ],
          }),
        }).catch(console.error);
      }
      break;
  }
};

// ─── Publish helper ────────────────────────────────────────────────────────
const publish = (topic, message) => {
  if (client && client.connected) {
    client.publish(topic, String(message));
  }
};

// ─── Init ──────────────────────────────────────────────────────────────────
const init = (io) => {
  client = mqtt.connect(
    `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`,
    {
      clientId: process.env.MQTT_CLIENT_ID,
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 3000,
    },
  );

  client.on("connect", () => {
    console.log("MQTT connected");
    const subscribeTopics = [
      TOPICS.DOOR_STATUS,
      TOPICS.DOOR_ACCESS,
      TOPICS.DOOR_UID_SCANNED,
      TOPICS.DOOR_UID_RESULT,
      TOPICS.DOOR_UID_RESPONSE,
      TOPICS.CLOTHES_STATUS,
      TOPICS.CLOTHES_WARNING,
      TOPICS.RAIN_STATUS,
      TOPICS.ROOM_DHT,
      TOPICS.ROOM_GAS,
      TOPICS.ROOM_PEOPLE,
      TOPICS.ROOM_LIGHT,
      TOPICS.ROOM_BUZZER,
      TOPICS.LIVING_LED_STATUS,
      TOPICS.BEDROOM_LED_STATUS,
      TOPICS.ROOM_FAN_STATUS,
      TOPICS.ALERT_BUZZER,
    ];
    client.subscribe(subscribeTopics, (err) => {
      if (err) console.error("MQTT subscribe error:", err);
      else console.log(`Subscribed to ${subscribeTopics.length} topics`);
    });
  });

  client.on("message", handleMessage);
  client.on("error", (err) => console.error("MQTT error:", err));
  client.on("offline", () => console.warn("MQTT offline"));
};

module.exports = { init, publish };
