import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Home, User, Lock, ArrowRight, Wifi, Thermometer, Shield, Mail, RefreshCw } from 'lucide-react';
import api from '../api/axios';

/* ── Dot grid decoration ── */
const DotGrid = ({ cols = 6, rows = 5, style = {} }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 6px)`,
    gap: 6,
    ...style,
  }}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <span key={i} style={{
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: '#FAC775',
        opacity: 0.45,
        display: 'block',
      }} />
    ))}
  </div>
);

/* ── Floating ambient card ── */
const AmbientCard = ({ icon, label, value, top, left, right, delay = '0s' }) => (
  <div style={{
    position: 'absolute',
    top, left, right,
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(238,236,232,0.9)',
    borderRadius: 14,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    animation: `floatCard 4s ease-in-out infinite`,
    animationDelay: delay,
    minWidth: 130,
    zIndex: 2,
  }}>
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 10,
      background: 'var(--accent-pale, #FFF3DC)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#EF9F27',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 10, color: '#888780', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', marginTop: 1 }}>{value}</div>
    </div>
  </div>
);

const LoginPage = () => {
  const [step,      setStep]      = useState('login'); // 'login' | 'otp'
  const [form,      setForm]      = useState({ username: '', password: '' });
  const [otp,       setOtp]       = useState('');
  const [userId,    setUserId]    = useState(null);
  const [hint,      setHint]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  const { setToken, setUser } = useAuthStore();
  const navigate              = useNavigate();

  // ── Countdown timer ───────────────────────────────────────────────────
  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Bước 1: Login ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);

      if (!res.data.twoFA) {
        // Không có 2FA → vào thẳng
        setToken(res.data.token);
        setUser({ username: res.data.username, role: res.data.role });
        navigate('/dashboard');
        return;
      }

      // Có 2FA → chuyển sang bước nhập OTP
      setUserId(res.data.userId);
      setHint(res.data.message);
      setStep('otp');
      startCountdown(300); // 5 phút
      toast.success('Đã gửi mã OTP!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      console.error("Chi tiết lỗi API:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 2: Xác thực OTP ──────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('OTP phải đủ 6 số!');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp });
      setToken(res.data.token);
      setUser({ username: res.data.username, role: res.data.role });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP không hợp lệ!');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // ── Gửi lại OTP ───────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await api.post('/auth/resend-otp', { userId });
      toast.success('Đã gửi lại OTP!');
      startCountdown(300);
    } catch {
      toast.error('Gửi lại thất bại!');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .login-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          border-radius: 12px;
          border: 1.5px solid #EEECE8;
          background: #FAF8F4;
          font-size: 14px;
          font-family: 'Inter', system-ui, sans-serif;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #B8B6B0; }
        .login-input:focus {
          border-color: #EF9F27;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(239,159,39,0.12);
        }

        .otp-input {
          width: 100%;
          padding: 16px 14px;
          border-radius: 12px;
          border: 1.5px solid #EEECE8;
          background: #FAF8F4;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 14px;
          text-align: center;
          font-family: 'Inter', system-ui, sans-serif;
          color: #EF9F27;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .otp-input::placeholder { color: #D8D6D0; letter-spacing: 10px; font-size: 20px; }
        .otp-input:focus {
          border-color: #EF9F27;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(239,159,39,0.12);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #EF9F27 0%, #FAC775 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(239,159,39,0.35);
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(239,159,39,0.42);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 12px rgba(239,159,39,0.3);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .back-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1.5px solid #EEECE8;
          background: #FAF8F4;
          color: #888780;
          font-size: 13px;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: border-color 0.2s, background 0.2s;
          margin-top: 10px;
        }
        .back-btn:hover {
          border-color: #D8D6D0;
          background: #F0EDE8;
          color: #444340;
        }

        .resend-btn {
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', system-ui, sans-serif;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .card-animate {
          animation: fadeSlideUp 0.5s ease forwards;
        }
        .card-animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .card-animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .card-animate-delay-3 { animation-delay: 0.3s; opacity: 0; }

        .otp-animate {
          animation: slideLeft 0.4s ease forwards;
        }

        /* Step indicator connector */
        .step-connector {
          flex: 1;
          height: 2px;
          margin-bottom: 20px;
          transition: background 0.4s;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        background: '#F7F5F0',
        overflow: 'hidden',
      }}>

        {/* ── Left panel: hero ── */}
        <div style={{
          flex: 1,
          display: 'none',
          position: 'relative',
          background: 'linear-gradient(145deg, #FFF8EE 0%, #FFF0D0 50%, #FAE8B0 100%)',
          overflow: 'hidden',
          ...(typeof window !== 'undefined' && window.innerWidth >= 900
            ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
            : {}),
        }}
          className="login-hero"
        >
          {/* Large decorative circle */}
          <div style={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            border: '1px solid rgba(239,159,39,0.18)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
          <div style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            border: '1px solid rgba(239,159,39,0.25)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
          <div style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(239,159,39,0.08)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />

          {/* Dot grid top-right */}
          <DotGrid cols={7} rows={6} style={{ position: 'absolute', top: 40, right: 40 }} />
          {/* Dot grid bottom-left */}
          <DotGrid cols={5} rows={4} style={{ position: 'absolute', bottom: 60, left: 50 }} />

          {/* Central house icon */}
          <div style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            background: '#EF9F27',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 40px rgba(239,159,39,0.4)',
            position: 'relative',
            zIndex: 1,
          }}>
            <Home size={40} strokeWidth={1.5} />
          </div>

          {/* Ambient floating cards */}
          <AmbientCard
            icon={<Thermometer size={16} strokeWidth={1.5} />}
            label="Nhiệt độ"
            value="28°C · 65%"
            top="22%"
            left="12%"
            delay="0s"
          />
          <AmbientCard
            icon={<Wifi size={16} strokeWidth={1.5} />}
            label="Trạng thái"
            value="Hoạt động"
            top="58%"
            right="10%"
            delay="1.3s"
          />
          <AmbientCard
            icon={<Shield size={16} strokeWidth={1.5} />}
            label="Bảo mật"
            value="An toàn"
            top="75%"
            left="15%"
            delay="2.1s"
          />

          {/* Brand label */}
          <div style={{
            position: 'absolute',
            bottom: 32,
            right: 36,
            fontSize: 11,
            color: '#BA7517',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Smart Home · 2025
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          background: '#FFFFFF',
          boxShadow: '-1px 0 0 #EEECE8',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Top-right dot texture */}
          <DotGrid cols={5} rows={4} style={{ position: 'absolute', top: 24, right: 24, opacity: 0.6 }} />

          <div style={{ width: '100%', maxWidth: 360 }}>

            {/* Logo row */}
            <div className="card-animate card-animate-delay-1" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 28,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#FFF3DC',
                border: '1px solid #FAE8B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF9F27',
              }}>
                <Home size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.2 }}>Smart Home</div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Hệ thống nhà thông minh</div>
              </div>
            </div>

            {/* ── Step indicator ── */}
            <div className="card-animate card-animate-delay-1" style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              {['Đăng nhập', 'Xác thực OTP'].map((label, i) => {
                const active = (i === 0 && step === 'login') || (i === 1 && step === 'otp');
                const done   = i === 0 && step === 'otp';
                return (
                  <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        background: done ? '#52A843' : active ? '#EF9F27' : '#EEECE8',
                        color: done || active ? '#fff' : '#B8B6B0',
                        transition: 'all 0.35s',
                        boxShadow: active ? '0 2px 10px rgba(239,159,39,0.35)' : done ? '0 2px 10px rgba(82,168,67,0.3)' : 'none',
                      }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span style={{
                        fontSize: 10,
                        marginTop: 4,
                        color: active ? '#EF9F27' : done ? '#52A843' : '#B8B6B0',
                        fontWeight: active ? 600 : 400,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        transition: 'color 0.35s',
                      }}>
                        {label}
                      </span>
                    </div>
                    {i === 0 && (
                      <div className="step-connector" style={{
                        background: step === 'otp' ? '#52A843' : '#EEECE8',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Heading */}
            <div className="card-animate card-animate-delay-2" style={{ marginBottom: 24 }}>
              <h1 style={{
                fontSize: 26,
                fontWeight: 300,
                color: '#1A1A1A',
                margin: '0 0 6px',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                {step === 'login' ? 'Chào mừng trở lại' : 'Xác thực 2 lớp'}
              </h1>
              <p style={{ fontSize: 13, color: '#888780', margin: 0, lineHeight: 1.6 }}>
                {step === 'login'
                  ? 'Đăng nhập để quản lý ngôi nhà của bạn'
                  : 'Nhập mã OTP được gửi đến email của bạn'}
              </p>
            </div>

            {/* ── Form login ── */}
            {step === 'login' && (
              <form
                onSubmit={handleSubmit}
                className="card-animate card-animate-delay-3"
              >
                {/* Username field */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#444340',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    Tên đăng nhập
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: focusedField === 'username' ? '#EF9F27' : '#B8B6B0',
                      transition: 'color 0.2s',
                      pointerEvents: 'none',
                      display: 'flex',
                    }}>
                      <User size={16} strokeWidth={1.5} />
                    </div>
                    <input
                      className="login-input"
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#444340',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    Mật khẩu
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: focusedField === 'password' ? '#EF9F27' : '#B8B6B0',
                      transition: 'color 0.2s',
                      pointerEvents: 'none',
                      display: 'flex',
                    }}>
                      <Lock size={16} strokeWidth={1.5} />
                    </div>
                    <input
                      className="login-input"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      Tiếp tục
                      <ArrowRight size={16} strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Form OTP ── */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="otp-animate">

                {/* Email hint */}
                <div style={{
                  background: '#FFF8EE',
                  border: '1px solid #FAE8B8',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: '#FFF3DC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF9F27',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <Mail size={14} strokeWidth={1.5} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#BA7517', lineHeight: 1.5 }}>
                    {hint}
                  </p>
                </div>

                {/* OTP input */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#444340',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    Nhập mã OTP (6 số)
                  </label>
                  <input
                    className="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="— — — — — —"
                    maxLength={6}
                    autoFocus
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Countdown & Resend */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}>
                  <span style={{
                    fontSize: 12,
                    color: countdown > 0 ? '#EF9F27' : '#C4533A',
                    fontWeight: 500,
                  }}>
                    {countdown > 0
                      ? `⏱ Hết hạn sau: ${formatTime(countdown)}`
                      : '⚠️ OTP đã hết hạn'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="resend-btn"
                    style={{
                      color: countdown > 0 ? '#B8B6B0' : '#EF9F27',
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={11} strokeWidth={2} />
                    Gửi lại OTP
                  </button>
                </div>

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="login-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <Shield size={16} strokeWidth={1.5} />
                      Xác thực
                    </>
                  )}
                </button>

                {/* Quay lại */}
                <button
                  type="button"
                  onClick={() => { setStep('login'); setOtp(''); }}
                  className="back-btn"
                >
                  ← Quay lại đăng nhập
                </button>
              </form>
            )}

            {/* Status indicators */}
            <div style={{
              marginTop: 36,
              paddingTop: 24,
              borderTop: '1px solid #EEECE8',
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
            }}>
              {[
                { dot: '#3B6D11', label: 'Kết nối ổn định' },
                { dot: '#EF9F27', label: 'Hệ thống sẵn sàng' },
              ].map(({ dot, label }) => (
                <div key={label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: '#888780',
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: dot,
                    flexShrink: 0,
                  }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-left accent strip */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #EF9F27, #FAC775, transparent)',
          }} />
        </div>
      </div>

      {/* Responsive: show left hero on wider screens */}
      <style>{`
        @media (min-width: 900px) {
          .login-hero { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default LoginPage;