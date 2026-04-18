const cron      = require('node-cron');
const DeviceLog = require('../models/DeviceLog');
const Schedule  = require('../models/Schedule');
const telegram  = require('./telegramService');

// Map device → topic + payload builder
const DEVICE_MAP = {
  door:        { topic: 'binnbom/door/cmd'       },
  fan:         { topic: 'binnbom/room/fan/cmd'   },
  living_led:  { topic: 'binnbom/living/led/cmd' },
  bedroom_led: { topic: 'binnbom/bedroom/led/cmd'},
  clothes:     { topic: 'binnbom/clothes/cmd'    },
};

const DEVICE_LABEL = {
  door:        'Cửa chính',
  fan:         'Quạt',
  living_led:  'Đèn phòng khách',
  bedroom_led: 'Đèn phòng ngủ',
  clothes:     'Giàn phơi',
};

let _mqttPublish = null;

const init = (mqttService) => {
  _mqttPublish = mqttService.publish;

  // ── Cron hẹn giờ: chạy mỗi phút ──────────────────────────────────────
  cron.schedule('* * * * *', async () => {
    try {
      const now     = new Date();
      const hour    = now.getHours();
      const minute  = now.getMinutes();
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
          device:  s.device,
          event:   'schedule_triggered',
          payload: { scheduleId: s._id, name: s.name, action: s.action },
          source:  'schedule',
        }).catch(console.error);

        // Cập nhật lastRanAt
        await Schedule.findByIdAndUpdate(s._id, { lastRanAt: now });

        // Gửi Telegram
        telegram.sendMessage(
          `⏰ <b>Hẹn giờ tự động</b>\n\n` +
          `📋 Lịch: <b>${s.name}</b>\n` +
          `🔧 Thiết bị: ${DEVICE_LABEL[s.device]}\n` +
          `⚡ Lệnh: <b>${s.action}</b>\n` +
          `🕐 Lúc: ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`
        );

        console.log(`[Schedule] "${s.name}" → ${s.device}: ${s.action}`);
      }
    } catch (err) {
      console.error('[Schedule cron error]', err.message);
    }
  }, { timezone: 'Asia/Ho_Chi_Minh' });

  // ── Cron báo cáo hàng ngày lúc 21:00 ─────────────────────────────────
  cron.schedule('0 21 * * *', async () => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [granted, denied, gasAlerts, intruders, tempLogs] = await Promise.all([
        DeviceLog.countDocuments({ event: 'access_granted', createdAt: { $gte: startOfDay } }),
        DeviceLog.countDocuments({ event: 'access_denied',  createdAt: { $gte: startOfDay } }),
        DeviceLog.countDocuments({ event: 'gas_detected',   createdAt: { $gte: startOfDay } }),
        DeviceLog.countDocuments({ event: 'intruder_alert', createdAt: { $gte: startOfDay } }),
        DeviceLog.find({ event: 'dht_record', createdAt: { $gte: startOfDay } }).select('payload'),
      ]);

      const avgTemp = tempLogs.length
        ? (tempLogs.reduce((s, l) => s + (l.payload?.temp || 0), 0) / tempLogs.length).toFixed(1)
        : 'N/A';

      telegram.alerts.dailyReport({ granted, denied, gasAlerts, intruders, avgTemp });
    } catch (err) {
      console.error('[Daily report error]', err.message);
    }
  }, { timezone: 'Asia/Ho_Chi_Minh' });

  console.log('Cron jobs initialized');
};

module.exports = { init };