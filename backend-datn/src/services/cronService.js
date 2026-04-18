const cron = require("node-cron");
const DeviceLog = require("../models/DeviceLog");
const Schedule = require("../models/Schedule");
const { sendEmail } = require("./emailService");

// Map device → topic + payload builder
const DEVICE_MAP = {
  door: { topic: "binnbom/door/cmd" },
  fan: { topic: "binnbom/room/fan/cmd" },
  living_led: { topic: "binnbom/living/led/cmd" },
  bedroom_led: { topic: "binnbom/bedroom/led/cmd" },
  clothes: { topic: "binnbom/clothes/cmd" },
};

const DEVICE_LABEL = {
  door: "Cửa chính",
  fan: "Quạt",
  living_led: "Đèn phòng khách",
  bedroom_led: "Đèn phòng ngủ",
  clothes: "Giàn phơi",
};

let _mqttPublish = null;

const init = (mqttService) => {
  _mqttPublish = mqttService.publish;

  // ── Cron hẹn giờ: chạy mỗi phút ──────────────────────────────────────
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const dayOfWeek = now.getDay(); // 0=CN, 1=T2...

        const schedules = await Schedule.find({
          enabled: true,
          hour,
          minute,
          days: dayOfWeek,
        });

        for (const s of schedules) {
          const map = DEVICE_MAP[s.device];
          if (!map) continue;

          // Publish MQTT
          _mqttPublish(map.topic, s.action);

          // Ghi log
          DeviceLog.create({
            device: s.device,
            event: "schedule_triggered",
            payload: { scheduleId: s._id, name: s.name, action: s.action },
            source: "schedule",
          }).catch(console.error);

          // Cập nhật lastRanAt
          await Schedule.findByIdAndUpdate(s._id, { lastRanAt: now });

          // Gửi Email thông báo lịch chạy
          const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          sendEmail({
            subject: `⏰ Hẹn giờ tự động – ${s.name}`,
            html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                        background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
              <div style="text-align:center;margin-bottom:24px">
                <h2 style="margin:0;color:#1e293b">🏠 Smart Home</h2>
                <p style="color:#64748b;font-size:13px;margin-top:6px">Thông báo hẹn giờ tự động</p>
              </div>
              <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#64748b">📋 Lịch</td>
                    <td style="padding:8px 0;font-weight:700">${s.name}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">🔧 Thiết bị</td>
                    <td style="padding:8px 0">${DEVICE_LABEL[s.device]}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">⚡ Lệnh</td>
                    <td style="padding:8px 0;font-weight:700">${s.action}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">🕐 Lúc</td>
                    <td style="padding:8px 0">${timeStr}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
              <p style="color:#94a3b8;font-size:11px;text-align:center">
                Email tự động từ hệ thống Smart Home. Vui lòng không trả lời.
              </p>
            </div>
          `,
          }).catch(console.error);

          console.log(`[Schedule] "${s.name}" → ${s.device}: ${s.action}`);
        }
      } catch (err) {
        console.error("[Schedule cron error]", err.message);
      }
    },
    { timezone: "Asia/Ho_Chi_Minh" },
  );

  // ── Cron báo cáo hàng ngày lúc 21:00 ─────────────────────────────────
  cron.schedule(
    "0 21 * * *",
    async () => {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [granted, denied, gasAlerts, intruders, tempLogs] =
          await Promise.all([
            DeviceLog.countDocuments({
              event: "access_granted",
              createdAt: { $gte: startOfDay },
            }),
            DeviceLog.countDocuments({
              event: "access_denied",
              createdAt: { $gte: startOfDay },
            }),
            DeviceLog.countDocuments({
              event: "gas_detected",
              createdAt: { $gte: startOfDay },
            }),
            DeviceLog.countDocuments({
              event: "intruder_alert",
              createdAt: { $gte: startOfDay },
            }),
            DeviceLog.find({
              event: "dht_record",
              createdAt: { $gte: startOfDay },
            }).select("payload"),
          ]);

        const avgTemp = tempLogs.length
          ? (
              tempLogs.reduce((s, l) => s + (l.payload?.temp || 0), 0) /
              tempLogs.length
            ).toFixed(1)
          : "N/A";

        const today = new Date().toLocaleDateString("vi-VN");

        sendEmail({
          subject: `📊 Báo cáo Smart Home ngày ${today}`,
          html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                      background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
            <div style="text-align:center;margin-bottom:24px">
              <h2 style="margin:0;color:#1e293b">🏠 Smart Home</h2>
              <p style="color:#64748b;font-size:13px;margin-top:6px">Báo cáo hoạt động hàng ngày – ${today}</p>
            </div>
            <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse">
              <tr style="background:#eff6ff">
                <td style="padding:10px 12px;border-radius:6px">🚪 Vào cửa thành công</td>
                <td style="padding:10px 12px;font-weight:700;text-align:right">${granted}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px">🚫 Từ chối truy cập</td>
                <td style="padding:10px 12px;font-weight:700;text-align:right">${denied}</td>
              </tr>
              <tr style="background:#fef2f2">
                <td style="padding:10px 12px;border-radius:6px">💨 Cảnh báo khí gas</td>
                <td style="padding:10px 12px;font-weight:700;text-align:right;color:${gasAlerts > 0 ? "#ef4444" : "#334155"}">${gasAlerts}</td>
              </tr>
              <tr style="background:#fef2f2">
                <td style="padding:10px 12px;border-radius:6px">🚨 Cảnh báo xâm nhập</td>
                <td style="padding:10px 12px;font-weight:700;text-align:right;color:${intruders > 0 ? "#ef4444" : "#334155"}">${intruders}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px">🌡️ Nhiệt độ trung bình</td>
                <td style="padding:10px 12px;font-weight:700;text-align:right">${avgTemp !== "N/A" ? avgTemp + " °C" : "N/A"}</td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
            <p style="color:#94a3b8;font-size:11px;text-align:center">
              Email tự động từ hệ thống Smart Home. Vui lòng không trả lời.
            </p>
          </div>
        `,
        }).catch(console.error);
      } catch (err) {
        console.error("[Daily report error]", err.message);
      }
    },
    { timezone: "Asia/Ho_Chi_Minh" },
  );

  console.log("Cron jobs initialized");
};

module.exports = { init };
