const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const crypto   = require('crypto');
const OTP      = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Username already exists' });

    const user = await User.create({ username, password, role });
    res.status(201).json({ token: signToken(user), username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateOTP = () =>
  crypto.randomInt(100000, 999999).toString();

// ─── POST /api/auth/login ──────────────────────────────────────────────────
// Bước 1: kiểm tra username/password → gửi OTP nếu 2FA bật
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }

    // Nếu tắt 2FA → trả token luôn
    if (!user.twoFA) {
      return res.json({
        token:    signToken(user),
        username: user.username,
        role:     user.role,
        twoFA:    false,
      });
    }

    // Xóa OTP cũ chưa dùng của user này
    await OTP.deleteMany({ userId: user._id });

    // Tạo OTP mới
    const otp       = generateOTP();
    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRES_MIN) || 5) * 60 * 1000
    );

    // Lưu OTP đã hash vào DB
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    await OTP.create({ userId: user._id, otp: otpHash, expiresAt });

    // Gửi email
    await sendOTPEmail(user.email, otp, user.username);

    // Trả về userId tạm để bước 2 dùng (không trả token)
    return res.json({
      twoFA:   true,
      userId:  user._id,
      message: `Mã OTP đã gửi tới ${user.email.replace(/(.{2}).*(@.*)/, '$1***$2')}`,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────
// Bước 2: nhập OTP → nhận token
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'Thiếu userId hoặc OTP!' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const record  = await OTP.findOne({
      userId,
      otp:  otpHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(401).json({ message: 'OTP không hợp lệ hoặc đã hết hạn!' });
    }

    // Đánh dấu đã dùng
    record.used = true;
    await record.save();

    const user = await User.findById(userId);
    res.json({
      token:    signToken(user),
      username: user.username,
      role:     user.role,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại!' });

    await OTP.deleteMany({ userId: user._id });

    const otp       = generateOTP();
    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRES_MIN) || 5) * 60 * 1000
    );
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    await OTP.create({ userId: user._id, otp: otpHash, expiresAt });
    await sendOTPEmail(user.email, otp, user.username);

    res.json({ message: 'Đã gửi lại OTP!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm endpoint này
exports.saveFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fcmToken: token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lưu token' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};