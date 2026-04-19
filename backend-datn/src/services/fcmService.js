const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');
const User = require('../models/User');

// Khởi tạo Firebase Admin (chỉ 1 lần)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Gửi thông báo đến tất cả user có FCM token
const sendToAll = async ({ title, body, data = {} }) => {
  try {
    // Lấy tất cả FCM token từ DB
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    const tokens = users.map(u => u.fcmToken).filter(Boolean);
    if (!tokens.length) return;

    const message = {
      notification: { title, body },
      data: { ...data, timestamp: Date.now().toString() },
      android: {
        priority: data.type === 'alert' ? 'high' : 'normal',
        notification: {
          channelId: data.type === 'alert' ? 'smart_home_alert' : 'smart_home_info',
          sound: 'default',
        },
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[FCM] Sent: ${response.successCount}/${tokens.length}`);
  } catch (err) {
    console.error('[FCM] Send error:', err);
  }
};

// Các hàm gửi thông báo cụ thể
module.exports = {
  notifyGas: () => sendToAll({
    title: '⚠️ Phát hiện khí gas!',
    body: 'Hệ thống đang bật quạt thông gió tự động.',
    data: { type: 'alert', screen: '/room' },
  }),

  notifyIntruder: () => sendToAll({
    title: '🚨 CẢNH BÁO XÂM NHẬP!',
    body: 'Phát hiện người lạ trong khu vực bảo vệ.',
    data: { type: 'alert', screen: '/room' },
  }),

  notifyHighTemp: (temp, hum) => sendToAll({
    title: `🌡️ Nhiệt độ quá cao: ${temp}°C`,
    body: `Nhiệt độ hiện tại là ${temp}°C (Độ ẩm: ${hum}%). Hãy kiểm tra thiết bị điện!`,
    data: { 
      type: 'alert', 
      screen: '/room',
      temp: temp.toString(),
      hum: hum.toString()
    },
  }),
};