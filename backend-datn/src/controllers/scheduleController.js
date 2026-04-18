const Schedule  = require('../models/Schedule');
const DeviceLog = require('../models/DeviceLog');

// Danh sách action hợp lệ theo device
const VALID_ACTIONS = {
  door:        ['OPEN', 'CLOSE'],
  fan:         ['ON', 'OFF', 'AUTO'],
  living_led:  ['ON', 'OFF', 'AUTO'],
  bedroom_led: ['ON', 'OFF', 'AUTO'],
  clothes:     ['IN', 'OUT', 'AUTO'],
};

// GET /api/schedules
exports.getAll = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ hour: 1, minute: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/schedules
exports.create = async (req, res) => {
  try {
    const { name, device, action, hour, minute, days, enabled } = req.body;

    // Validate
    if (!VALID_ACTIONS[device]?.includes(action)) {
      return res.status(400).json({
        message: `Action "${action}" không hợp lệ cho thiết bị "${device}"`,
      });
    }
    if (!days?.length) {
      return res.status(400).json({ message: 'Phải chọn ít nhất 1 ngày!' });
    }

    const schedule = await Schedule.create({ name, device, action, hour, minute, days, enabled });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/schedules/:id
exports.update = async (req, res) => {
  try {
    const { name, device, action, hour, minute, days, enabled } = req.body;

    if (device && action && !VALID_ACTIONS[device]?.includes(action)) {
      return res.status(400).json({ message: `Action không hợp lệ cho thiết bị này` });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { name, device, action, hour, minute, days, enabled },
      { new: true, runValidators: true }
    );
    if (!schedule) return res.status(404).json({ message: 'Không tìm thấy lịch!' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/schedules/:id/toggle — bật/tắt nhanh
exports.toggle = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Không tìm thấy lịch!' });

    schedule.enabled = !schedule.enabled;
    await schedule.save();
    res.json({ enabled: schedule.enabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/schedules/:id
exports.remove = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa lịch!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/schedules/logs
exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const logs  = await DeviceLog.find({ source: 'schedule' })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};