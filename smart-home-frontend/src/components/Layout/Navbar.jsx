import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, Bell, Mic } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDeviceStore from '../../store/deviceStore';
import { useState, useRef } from 'react';
import ThemeToggle from '../ui/ThemeToggle';

// API
import { sendDoorCmd } from '../../api/doorApi';
import { fanCmd, livingLedCmd, bedroomLedCmd } from '../../api/roomApi';
import { clothesCmd } from '../../api/clothesApi';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { intruderAlert, gas } = useDeviceStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasAlert = intruderAlert || gas === 1;

  // 🎤 STATE
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // 🔊 TEXT TO SPEECH
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // ⚡ chống spam lệnh
  const lastCommandTime = useRef(0);

  const COOLDOWN = 1500;

  const canRun = () => {
    const now = Date.now();
    if (now - lastCommandTime.current < COOLDOWN) return false;
    lastCommandTime.current = now;
    return true;
  };

  // 🎤 START / STOP LISTENING
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ voice 😢");
      return;
    }

    // 👉 TẮT
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      speak("Đã tắt điều khiển giọng nói");
      return;
    }

    // 👉 BẬT
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    setListening(true);
    speak("Bắt đầu nghe");
    recognition.start();

    recognition.onresult = async (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript.toLowerCase();

      console.log("🎤 Bạn nói:", text);

      let handled = false;

      try {
        if (text.includes("mở cửa") && canRun()) {
          await sendDoorCmd("OPEN");
          speak("Đã mở cửa");
          handled = true;
        } 
        else if (text.includes("đóng cửa") && canRun()) {
          await sendDoorCmd("CLOSE");
          speak("Đã đóng cửa");
          handled = true;
        }

        else if (text.includes("bật đèn phòng khách") && canRun()) {
          await livingLedCmd("ON");
          speak("Đã bật đèn phòng khách");
          handled = true;
        } 
        else if (text.includes("tắt đèn phòng khách") && canRun()) {
          await livingLedCmd("OFF");
          speak("Đã tắt đèn phòng khách");
          handled = true;
        }

        else if (text.includes("bật đèn phòng ngủ") && canRun()) {
          await bedroomLedCmd("ON");
          speak("Đã bật đèn phòng ngủ");
          handled = true;
        } 
        else if (text.includes("tắt đèn phòng ngủ") && canRun()) {
          await bedroomLedCmd("OFF");
          speak("Đã tắt đèn phòng ngủ");
          handled = true;
        }

        else if (text.includes("bật quạt") && canRun()) {
          await fanCmd("ON");
          speak("Đã bật quạt");
          handled = true;
        } 
        else if (text.includes("tắt quạt") && canRun()) {
          await fanCmd("OFF");
          speak("Đã tắt quạt");
          handled = true;
        }

        else if (text.includes("cất đồ") && canRun()) {
          await clothesCmd("IN");
          speak("Đã thu giàn phơi");
          handled = true;
        } 
        else if (text.includes("phơi đồ") && canRun()) {
          await clothesCmd("OUT");
          speak("Đã phơi đồ");
          handled = true;
        }

        // ❗ fallback
        if (!handled) {
          speak("Tôi chưa hiểu lệnh");
        }

      } catch (err) {
        console.error("❌ Lỗi API:", err);
        speak("Có lỗi xảy ra");
      }
    };

    // ⭐ giữ nghe liên tục
    recognition.onend = () => {
      if (recognitionRef.current && listening) {
        recognition.start();
      }
    };
  };

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
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid #f5c2c2',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.03em',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <AlertTriangle size={13} strokeWidth={2} />
            {intruderAlert ? 'XÂM NHẬP!' : 'PHÁT HIỆN KHÍ GAS!'}
          </span>
        ) : (
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-hint)',
            }}
          >
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
          style={{
            background: listening ? '#fee2e2' : undefined,
            color: listening ? '#dc2626' : undefined,
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
                position: 'absolute',
                top: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--danger-text)',
                border: '1.5px solid var(--bg-card)',
              }}
            />
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: 'var(--border-default)',
            margin: '0 4px',
          }}
        />

        {/* USER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            className="avatar avatar-sm"
            style={{ background: 'var(--accent-primary)' }}
          >
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-heading)',
            }}
          >
            {user?.username || 'Admin'}
          </span>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-muted)',
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-heading)';
          }}
          onMouseLeave={(e) => {
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