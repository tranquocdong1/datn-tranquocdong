const DeviceLog   = require('../models/DeviceLog');
const DeviceState = require('../models/DeviceState');

// GET /api/stats/overview
// Trả về trạng thái tất cả thiết bị hiện tại
exports.getOverview = async (req, res) => {
  try {
    const state = await DeviceState.findOne({});
    res.json(state || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stats/logs?device=door&limit=100&page=1
// Lịch sử log có phân trang
exports.getLogs = async (req, res) => {
  try {
    const { device, event, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (device) filter.device = device;
    if (event)  filter.event  = event;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await DeviceLog.countDocuments(filter);
    const logs  = await DeviceLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data:       logs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stats/access?days=7
// Thống kê access granted/denied theo ngày (7 ngày gần nhất)
exports.getAccessStats = async (req, res) => {
  try {
    const days  = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await DeviceLog.aggregate([
      {
        $match: {
          device:    'door',
          event:     { $in: ['access_granted', 'access_denied'] },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            date:  { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            event: '$event',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Format lại cho dễ dùng ở frontend
    const result = {};
    data.forEach(({ _id, count }) => {
      if (!result[_id.date]) result[_id.date] = { granted: 0, denied: 0 };
      if (_id.event === 'access_granted') result[_id.date].granted = count;
      if (_id.event === 'access_denied')  result[_id.date].denied  = count;
    });

    res.json(Object.entries(result).map(([date, v]) => ({ date, ...v })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stats/temperature?hours=24
// Lịch sử nhiệt độ/độ ẩm trong N giờ gần nhất
exports.getTemperatureHistory = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await DeviceLog.find({
      device:    'room',
      event:     'dht_record',
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .select('payload createdAt');

    res.json(logs.map((l) => ({
      time: l.createdAt,
      temp: l.payload?.temp,
      hum:  l.payload?.hum,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stats/summary
// Tổng hợp nhanh: tổng lượt vào/ra hôm nay, cảnh báo gas, xâm nhập
exports.getSummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [granted, denied, gasAlerts, intruders] = await Promise.all([
      DeviceLog.countDocuments({ event: 'access_granted', createdAt: { $gte: startOfDay } }),
      DeviceLog.countDocuments({ event: 'access_denied',  createdAt: { $gte: startOfDay } }),
      DeviceLog.countDocuments({ event: 'gas_detected',   createdAt: { $gte: startOfDay } }),
      DeviceLog.countDocuments({ event: 'intruder_alert', createdAt: { $gte: startOfDay } }),
    ]);

    res.json({ granted, denied, gasAlerts, intruders, date: startOfDay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};