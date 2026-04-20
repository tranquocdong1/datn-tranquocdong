const mqtt = require("mqtt");
const TOPICS = require("../config/mqtt");
const DeviceState = require("../models/DeviceState");
const DeviceLog = require("../models/DeviceLog");
const socket = require("./socketService");
const { sendEmail } = require("./emailService");
const notificationService = require("./fcmService.js");

let client;
let lastScannedUID = "";

// ─── Cấu hình chặn gửi liên tục (Throttling) ────────────────────────────────
const lastAlerts = {
  gas: 0,
  temp: 0,
  intruder: 0
};
const ALERT_COOLDOWN = 2 * 60 * 1000;
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
  const now = Date.now();

  switch (topic) {
    case TOPICS.DOOR_STATUS:
      await updateState({ "door.status": msg });
      socket.emit("door:status", { status: msg });
      break;

    case TOPICS.DOOR_ACCESS:
      const granted = msg === "granted";
      saveLog("door", granted ? "access_granted" : "access_denied", { result: msg });
      socket.emit("door:access", { result: msg });
      break;

    case TOPICS.RAIN_STATUS:
      await updateState({ "rain.status": msg });
      socket.emit("rain:status", { status: msg });
      break;

    // ✅ FIX: Thêm xử lý giàn phơi
    case TOPICS.CLOTHES_STATUS:
      await updateState({ "clothes.status": msg });
      socket.emit("clothes:status", { status: msg });
      break;

    case TOPICS.CLOTHES_WARNING:
      socket.emit("clothes:warning", { reason: msg });
      break;

    // 🔴 1. CẢNH BÁO NHIỆT ĐỘ CAO
    case TOPICS.ROOM_DHT: {
      try {
        const { temp, hum } = JSON.parse(msg);
        await updateState({ "room.temperature": temp, "room.humidity": hum });
        socket.emit("room:dht", { temp, hum });

        if (temp >= 35 && (now - lastAlerts.temp > ALERT_COOLDOWN)) {
          lastAlerts.temp = now;
          // Gửi FCM
          notificationService.notifyHighTemp(temp, hum);
          // Gửi Email
          sendEmail({
            subject: `🌡️ Cảnh báo nhiệt độ cao: ${temp}°C`,
            html: alertEmail({
              icon: "🌡️", title: "Nhiệt độ báo động",
              rows: [["Nhiệt độ", `${temp}°C`, true], ["Độ ẩm", `${hum}%`], ["Thời gian", new Date().toLocaleString("vi-VN")]]
            })
          }).catch(console.error);
        }
      } catch (_) {}
      break;
    }

    // 🔴 2. CẢNH BÁO RÒ RỈ KHÍ GAS
    case TOPICS.ROOM_GAS: {
      const gasVal = parseInt(msg);
      await updateState({ "room.gas": gasVal });
      socket.emit("room:gas", { gas: gasVal });

      if (gasVal === 1 && (now - lastAlerts.gas > ALERT_COOLDOWN)) {
        lastAlerts.gas = now;
        saveLog("room", "gas_detected", { value: gasVal });
        // Gửi FCM
        notificationService.notifyGas();
        // Gửi Email
        sendEmail({
          subject: "💨 KHẨN CẤP: Phát hiện rò rỉ khí gas!",
          html: alertEmail({
            icon: "⚠️", title: "Cảnh báo nguy hiểm",
            rows: [["Trạng thái", "Phát hiện GAS", true], ["Hành động", "Thông gió ngay lập tức!", true]]
          })
        }).catch(console.error);
      }
      break;
    }

    // 🔴 3. CẢNH BÁO XÂM NHẬP (CÒI)
    case TOPICS.ALERT_BUZZER:
      if (msg === "INTRUDER" && (now - lastAlerts.intruder > ALERT_COOLDOWN)) {
        lastAlerts.intruder = now;
        saveLog("security", "intruder_alert", {});
        socket.emit("alert:intruder", {});
        // Gửi FCM
        notificationService.notifyIntruder();
        // Gửi Email
        sendEmail({
          subject: "🚨 KHẨN CẤP: Phát hiện xâm nhập!",
          html: alertEmail({
            icon: "🚨", title: "Cảnh báo an ninh",
            rows: [["Trạng thái", "PHÁT HIỆN XÂM NHẬP", true], ["Thời gian", new Date().toLocaleString("vi-VN"), true]]
          })
        }).catch(console.error);
      }
      break;

    case TOPICS.DOOR_UID_SCANNED:
      lastScannedUID = msg;
      socket.emit("door:uid_scanned", { uid: msg });
      break;

    default:
      // Các topic khác chỉ cập nhật State và Socket (Real-time App)
      // Không gửi thông báo ra ngoài
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
      clientId: `${process.env.MQTT_CLIENT_ID}_${Math.random().toString(16).slice(2, 8)}`,
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