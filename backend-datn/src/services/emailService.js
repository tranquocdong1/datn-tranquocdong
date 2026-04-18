const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Generic alert/notification sender ────────────────────────────────────
// Dùng cho mqttService, cronService, v.v.
// Params: { to?, subject, html }
// `to` mặc định là EMAIL_USER nếu không truyền
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      to || process.env.EMAIL_USER,
    subject,
    html,
  });
};

// ─── OTP email ────────────────────────────────────────────────────────────
const sendOTPEmail = async (toEmail, otp, username) => {
  const expiresMin = process.env.OTP_EXPIRES_MIN || 5;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: '🔐 Mã xác thực đăng nhập Smart Home',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                  background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="margin:0;color:#1e293b">🏠 Smart Home</h2>
          <p style="color:#64748b;font-size:13px;margin-top:6px">Hệ thống xác thực 2 lớp</p>
        </div>

        <p style="color:#334155;font-size:14px">Xin chào <b>${username}</b>,</p>
        <p style="color:#334155;font-size:14px">
          Mã OTP của bạn để đăng nhập vào hệ thống Smart Home:
        </p>

        <div style="text-align:center;margin:28px 0">
          <span style="display:inline-block;font-size:36px;font-weight:700;
                       letter-spacing:10px;color:#3b82f6;background:#eff6ff;
                       padding:16px 32px;border-radius:12px;border:2px dashed #93c5fd">
            ${otp}
          </span>
        </div>

        <p style="color:#64748b;font-size:13px;text-align:center">
          Mã có hiệu lực trong <b>${expiresMin} phút</b>.<br/>
          Không chia sẻ mã này cho bất kỳ ai.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#94a3b8;font-size:11px;text-align:center">
          Nếu bạn không thực hiện đăng nhập này, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOTPEmail };