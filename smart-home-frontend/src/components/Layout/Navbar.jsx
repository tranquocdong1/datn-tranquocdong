import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, Bell, Mic } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDeviceStore from '../../store/deviceStore';
import { useState, useRef, useCallback } from 'react';
import ThemeToggle from '../ui/ThemeToggle';

import { sendDoorCmd } from '../../api/doorApi';
import { fanCmd, livingLedCmd, bedroomLedCmd } from '../../api/roomApi';
import { clothesCmd } from '../../api/clothesApi';

// ─── TTS ngắn gọn để giảm delay phản hồi ───────────────────────────────────
const speak = (text) => {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'vi-VN';
  utter.rate = 1.25; // nói nhanh hơn chút → bớt delay cảm nhận
  window.speechSynthesis.speak(utter);
};

// ─── COMMANDS TABLE (dễ mở rộng, không dùng if/else chain) ─────────────────
// Sắp xếp: keyword dài trước để tránh match nhầm
// VD: "bật đèn phòng khách" phải trước "bật đèn"
const COMMANDS = [
  { kw: 'mở cửa',            fn: () => sendDoorCmd('OPEN'),    tts: 'Mở cửa' },
  { kw: 'đóng cửa',          fn: () => sendDoorCmd('CLOSE'),   tts: 'Đóng cửa' },
  { kw: 'bật đèn phòng khách', fn: () => livingLedCmd('ON'),   tts: 'Đèn phòng khách bật' },
  { kw: 'auto đèn phòng khách', fn: () => livingLedCmd('AUTO'),   tts: 'Đèn phòng khách chuyển sang auto' },
  { kw: 'tắt đèn phòng khách', fn: () => livingLedCmd('OFF'),  tts: 'Đèn phòng khách tắt' },
  { kw: 'bật đèn phòng ngủ',  fn: () => bedroomLedCmd('ON'),  tts: 'Đèn phòng ngủ bật' },
  { kw: 'tắt đèn phòng ngủ',  fn: () => bedroomLedCmd('OFF'), tts: 'Đèn phòng ngủ tắt' },
  { kw: 'bật quạt',           fn: () => fanCmd('ON'),          tts: 'Bật quạt' },
  { kw: 'tắt quạt',           fn: () => fanCmd('OFF'),         tts: 'Tắt quạt' },
  { kw: 'cất đồ',             fn: () => clothesCmd('IN'),      tts: 'Thu giàn phơi' },
  { kw: 'phơi đồ',            fn: () => clothesCmd('OUT'),     tts: 'Phơi đồ' },
];

// ─── COMPONENT ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { intruderAlert, gas } = useDeviceStore();
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);

  // FIX 1: dùng ref thay vì state để tránh stale closure trong onend/onerror
  const recognitionRef  = useRef(null);
  const isListeningRef  = useRef(false);

  // FIX 2: isProcessing block hẳn lệnh mới trong khi await đang chạy
  const isProcessing    = useRef(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const hasAlert = intruderAlert || gas === 1;

  // ─── tryRun: guard chống race condition ─────────────────────────────────
  const tryRun = useCallback(async (fn, tts) => {
    if (isProcessing.current) {
      speak('Đang xử lý');
      return;
    }
    isProcessing.current = true;

    // Nói NGAY lập tức (trước await) → user thấy phản hồi tức thì
    speak(tts);

    try {
      await fn();
    } catch (err) {
      console.error('❌ API lỗi:', err);
      speak('Lỗi');
    } finally {
      isProcessing.current = false;
    }
  }, []);

  // ─── handleResult: xử lý transcript ────────────────────────────────────
  const handleResult = useCallback(async (event) => {
    const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log('🎤', text);

    const matched = COMMANDS.find(({ kw }) => text.includes(kw));

    if (matched) {
      await tryRun(matched.fn, matched.tts);
    } else {
      speak('Không hiểu');
    }
  }, [tryRun]);

  // ─── startListening ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt không hỗ trợ voice 😢');
      return;
    }

    // Toggle OFF
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setListening(false);
      speak('Tắt mic');
      return;
    }

    // Toggle ON
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = false; // chỉ xử lý kết quả cuối → nhanh hơn
    recognition.maxAlternatives = 1;   // không cần alternatives → ít xử lý hơn

    recognitionRef.current = recognition;
    isListeningRef.current = true;
    setListening(true);

    recognition.onresult = handleResult;

    // FIX 1: đọc isListeningRef.current (ref) thay vì `listening` (stale state)
    recognition.onend = () => {
      if (isListeningRef.current) {
        // Delay nhỏ tránh restart quá nhanh gây lỗi trên một số trình duyệt
        setTimeout(() => {
          if (isListeningRef.current) recognition.start();
        }, 100);
      }
    };

    // FIX 3: onerror handler — trước đây không có
    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);

      if (e.error === 'not-allowed') {
        speak('Cần cấp quyền mic');
        isListeningRef.current = false;
        setListening(false);
        recognitionRef.current = null;
        return;
      }

      // network / no-speech / audio-capture → tự restart nếu vẫn muốn nghe
      if (e.error === 'no-speech' || e.error === 'network') {
        // onend sẽ tự restart, không cần làm gì thêm
        return;
      }

      // Lỗi khác → dừng hẳn
      isListeningRef.current = false;
      setListening(false);
      recognitionRef.current = null;
      speak('Lỗi mic');
    };

    speak('Bắt đầu nghe');
    recognition.start();
  }, [handleResult]);

  // ─── JSX ────────────────────────────────────────────────────────────────
  return (
    <header
      style={{
        height: 60,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-xl)',
        flexShrink: 0,
      }}
    >
      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {hasAlert ? (
          <span
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--danger-bg)', color: 'var(--danger-text)',
              border: '1px solid #f5c2c2', padding: '5px 14px',
              borderRadius: 'var(--radius-full)', fontSize: 12,
              fontWeight: 600, letterSpacing: '0.03em',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <AlertTriangle size={13} strokeWidth={2} />
            {intruderAlert ? 'XÂM NHẬP!' : 'PHÁT HIỆN KHÍ GAS!'}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-hint)' }}>
            Hệ thống hoạt động bình thường
          </span>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle />
        <div style={{ width: 1, height: 20, background: 'var(--border-default)', margin: '0 4px' }} />

        {/* 🎤 VOICE */}
        <button
          className="icon-btn"
          onClick={startListening}
          title={listening ? 'Tắt mic' : 'Bật điều khiển giọng nói'}
          style={{
            background: listening ? '#fee2e2' : undefined,
            color:      listening ? '#dc2626' : undefined,
          }}
        >
          <Mic size={17} strokeWidth={1.5} />
        </button>

        {/* 🔔 Bell */}
        <button className="icon-btn" style={{ position: 'relative' }}>
          <Bell size={17} strokeWidth={1.5} />
          {hasAlert && (
            <span
              style={{
                position: 'absolute', top: 8, right: 8,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--danger-text)',
                border: '1.5px solid var(--bg-card)',
              }}
            />
          )}
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border-default)', margin: '0 4px' }} />

        {/* USER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar avatar-sm" style={{ background: 'var(--accent-primary)' }}>
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-heading)' }}>
            {user?.username || 'Admin'}
          </span>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-muted)', fontSize: 12,
            color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-heading)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Navbar;