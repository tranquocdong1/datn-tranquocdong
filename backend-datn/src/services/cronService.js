const cron      = require('node-cron');
const DeviceLog = require('../models/DeviceLog');
const telegram  = require('./telegramService');

const init = () => {
  // Chạy lúc 21:00 mỗi ngày
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
      console.log('Daily report sent to Telegram');
    } catch (err) {
      console.error('Cron error:', err);
    }
  }, { timezone: 'Asia/Ho_Chi_Minh' });

  console.log('Cron jobs initialized');
};

module.exports = { init };