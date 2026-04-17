const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ─── Gửi tin nhắn text thường ─────────────────────────────────────────────
const sendMessage = (text) => {
  if (!CHAT_ID) return;
  bot.sendMessage(CHAT_ID, text, { parse_mode: 'HTML' }).catch(console.error);
};

// ─── Gửi tin nhắn có nút bấm ──────────────────────────────────────────────
const sendAlert = (text, buttons = []) => {
  if (!CHAT_ID) return;
  const opts = {
    parse_mode: 'HTML',
    ...(buttons.length > 0 && {
      reply_markup: {
        inline_keyboard: [buttons],
      },
    }),
  };
  bot.sendMessage(CHAT_ID, text, opts).catch(console.error);
};

// ─── Các loại cảnh báo ────────────────────────────────────────────────────
const alerts = {
  // Xâm nhập
  intruder: () => sendAlert(
    `🚨 <b>CẢNH BÁO XÂM NHẬP!</b>\n\n` +
    `⏰ Thời gian: ${new Date().toLocaleString('vi')}\n` +
    `📍 Vị trí: Cửa chính\n` +
    `❌ Quẹt thẻ sai 3 lần liên tiếp`,
    [
      { text: '🔒 Khóa cửa',    callback_data: 'door_close' },
      { text: '🔔 Tắt còi',     callback_data: 'buzzer_off' },
    ]
  ),

  // Phát hiện gas
  gasDetected: () => sendAlert(
    `⚠️ <b>PHÁT HIỆN KHÍ GAS!</b>\n\n` +
    `⏰ Thời gian: ${new Date().toLocaleString('vi')}\n` +
    `💨 Hệ thống đang bật quạt thông gió tự động`,
    [
      { text: '🌀 Bật quạt',    callback_data: 'fan_on'  },
      { text: '✅ Đã xử lý',    callback_data: 'gas_ack' },
    ]
  ),

  // Mở cửa thành công
  doorOpened: (uid) => sendMessage(
    `✅ <b>Cửa đã mở</b>\n\n` +
    `⏰ ${new Date().toLocaleString('vi')}\n` +
    `🪪 Thẻ: <code>${uid}</code>`
  ),

  // Thẻ bị từ chối
  doorDenied: (uid) => sendAlert(
    `❌ <b>Thẻ không hợp lệ!</b>\n\n` +
    `⏰ ${new Date().toLocaleString('vi')}\n` +
    `🪪 Thẻ lạ: <code>${uid}</code>`,
    [
      { text: '➕ Thêm thẻ này', callback_data: `add_uid:${uid}` },
      { text: '🚫 Bỏ qua',      callback_data: 'ignore'          },
    ]
  ),

  // Nhiệt độ cao
  highTemp: (temp, hum) => sendMessage(
    `🌡️ <b>Nhiệt độ cao bất thường!</b>\n\n` +
    `🌡️ Nhiệt độ: <b>${temp}°C</b>\n` +
    `💧 Độ ẩm: ${hum}%\n` +
    `⏰ ${new Date().toLocaleString('vi')}`
  ),

  // Trời mưa
  rainDetected: () => sendMessage(
    `🌧️ <b>Trời đang mưa!</b>\n` +
    `👕 Giàn phơi đã tự động thu vào.\n` +
    `⏰ ${new Date().toLocaleString('vi')}`
  ),

  // Trời tạnh
  rainCleared: () => sendMessage(
    `☀️ <b>Trời đã tạnh!</b>\n` +
    `👕 Giàn phơi đã tự động đẩy ra.\n` +
    `⏰ ${new Date().toLocaleString('vi')}`
  ),

  // Báo cáo hàng ngày (gọi theo cron)
  dailyReport: (data) => sendMessage(
    `📊 <b>Báo cáo hệ thống hôm nay</b>\n\n` +
    `✅ Lượt vào: <b>${data.granted}</b>\n` +
    `❌ Lượt từ chối: <b>${data.denied}</b>\n` +
    `⚠️ Cảnh báo gas: <b>${data.gasAlerts}</b>\n` +
    `🚨 Cảnh báo xâm nhập: <b>${data.intruders}</b>\n` +
    `🌡️ Nhiệt độ TB: <b>${data.avgTemp}°C</b>\n` +
    `⏰ ${new Date().toLocaleDateString('vi')}`
  ),
};

// ─── Xử lý nút bấm callback từ Telegram ──────────────────────────────────
const initCallbacks = (mqttService, TOPICS) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const msgId = query.message.message_id;

    // Trả lời để tắt loading trên nút
    bot.answerCallbackQuery(query.id);

    if (data === 'door_close') {
      mqttService.publish(TOPICS.DOOR_CMD, 'CLOSE');
      bot.editMessageText('🔒 Đã gửi lệnh khóa cửa!', { chat_id: CHAT_ID, message_id: msgId });
    }

    if (data === 'buzzer_off') {
      mqttService.publish(TOPICS.ALERT_BUZZER, 'OFF');
      bot.editMessageText('🔕 Đã tắt còi cảnh báo!', { chat_id: CHAT_ID, message_id: msgId });
    }

    if (data === 'fan_on') {
      mqttService.publish(TOPICS.ROOM_FAN_CMD, 'ON');
      bot.editMessageText('🌀 Đã bật quạt thông gió!', { chat_id: CHAT_ID, message_id: msgId });
    }

    if (data === 'gas_ack') {
      bot.editMessageText('✅ Đã ghi nhận, theo dõi tiếp...', { chat_id: CHAT_ID, message_id: msgId });
    }

    if (data.startsWith('add_uid:')) {
      const uid = data.split(':')[1];
      mqttService.publish(TOPICS.DOOR_UID_ADD, uid);
      bot.editMessageText(`✅ Đã thêm thẻ <code>${uid}</code>!`, {
        chat_id: CHAT_ID, message_id: msgId, parse_mode: 'HTML',
      });
    }

    if (data === 'ignore') {
      bot.editMessageText('🚫 Đã bỏ qua.', { chat_id: CHAT_ID, message_id: msgId });
    }
  });

  // ─── Lệnh /status gửi trạng thái hiện tại ─────────────────────────────
  const DeviceState = require('../models/DeviceState');
  bot.onText(/\/status/, async (msg) => {
    try {
      const state = await DeviceState.findOne({});
      const text =
        `📊 <b>Trạng thái hệ thống</b>\n\n` +
        `🚪 Cửa: <b>${state?.door?.status === 'open' ? 'Đang mở' : 'Đã đóng'}</b>\n` +
        `🌧️ Thời tiết: <b>${state?.rain?.status === 'raining' ? 'Đang mưa' : 'Trời nắng'}</b>\n` +
        `👕 Giàn phơi: <b>${state?.clothes?.status === 'in' ? 'Thu vào' : 'Đang phơi'}</b>\n` +
        `🌡️ Nhiệt độ: <b>${state?.room?.temperature}°C</b>\n` +
        `💧 Độ ẩm: <b>${state?.room?.humidity}%</b>\n` +
        `👥 Số người: <b>${state?.room?.people}</b>\n` +
        `⚠️ Gas: <b>${state?.room?.gas === 1 ? 'Phát hiện!' : 'Bình thường'}</b>\n` +
        `💡 Đèn PK: <b>${state?.living?.ledStatus === '1' ? 'Bật' : 'Tắt'}</b>\n` +
        `💡 Đèn PN: <b>${state?.bedroom?.ledStatus === '1' ? 'Bật' : 'Tắt'}</b>\n` +
        `🌀 Quạt: <b>${state?.room?.fanStatus === '1' ? 'Bật' : 'Tắt'}</b>`;
      bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
    } catch {
      bot.sendMessage(msg.chat.id, '❌ Lỗi lấy trạng thái!');
    }
  });

  // ─── Lệnh /door để điều khiển cửa ─────────────────────────────────────
  bot.onText(/\/door (.+)/, (msg, match) => {
    const cmd = match[1].toUpperCase();
    if (!['OPEN', 'CLOSE'].includes(cmd)) {
      return bot.sendMessage(msg.chat.id, '❌ Lệnh: /door OPEN hoặc /door CLOSE');
    }
    mqttService.publish(TOPICS.DOOR_CMD, cmd);
    bot.sendMessage(msg.chat.id, `✅ Đã gửi lệnh ${cmd} cửa!`);
  });

  // ─── Lệnh /fan ─────────────────────────────────────────────────────────
  bot.onText(/\/fan (.+)/, (msg, match) => {
    const cmd = match[1].toUpperCase();
    if (!['ON', 'OFF', 'AUTO'].includes(cmd)) {
      return bot.sendMessage(msg.chat.id, '❌ Lệnh: /fan ON | OFF | AUTO');
    }
    mqttService.publish(TOPICS.ROOM_FAN_CMD, cmd);
    bot.sendMessage(msg.chat.id, `✅ Quạt: ${cmd}`);
  });

  // ─── Lệnh /help ────────────────────────────────────────────────────────
  bot.onText(/\/help|\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🏠 <b>Smart Home Bot</b>\n\n` +
      `/status — Xem trạng thái hệ thống\n` +
      `/door OPEN|CLOSE — Điều khiển cửa\n` +
      `/fan ON|OFF|AUTO — Điều khiển quạt\n` +
      `/help — Danh sách lệnh`,
      { parse_mode: 'HTML' }
    );
  });
};

module.exports = { sendMessage, sendAlert, alerts, initCallbacks };