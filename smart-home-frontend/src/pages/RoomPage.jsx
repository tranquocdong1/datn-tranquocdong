import { useState }   from 'react';
import { toast }      from 'react-hot-toast';
import { fanCmd, livingLedCmd, bedroomLedCmd, alertCmd } from '../api/roomApi';
import useDeviceStore from '../store/deviceStore';
import ToggleButton   from '../components/ui/ToggleButton';
import StatusCard     from '../components/cards/StatusCard';

const ControlGroup = ({ title, status, onCmd, activeColor }) => (
  <div style={{
    background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>{title}</span>
      <span style={{
        padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
        background: status === '1' ? '#f0fdf4' : '#f1f5f9',
        color:      status === '1' ? '#22c55e' : '#94a3b8',
      }}>
        {status === '1' ? 'Đang bật' : 'Tắt'}
      </span>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {['ON', 'OFF', 'AUTO'].map((cmd) => (
        <ToggleButton key={cmd} label={cmd} onClick={() => onCmd(cmd)} color={activeColor} />
      ))}
    </div>
  </div>
);

const RoomPage = () => {
  const {
    temperature, humidity, gas, people,
    light, buzzer, fanStatus, livingLed, bedroomLed,
  } = useDeviceStore();
  const [alertLoading, setAlertLoading] = useState(false);

  const handleAlert = async (cmd) => {
    setAlertLoading(true);
    try {
      await alertCmd(cmd);
      toast(cmd === 'INTRUDER' ? '🚨 Đã kích hoạt còi!' : '🔕 Đã tắt còi');
    } catch { toast.error('Lỗi!'); }
    finally  { setAlertLoading(false); }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
        Quản lý phòng
      </h2>

      {/* Cảm biến */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatusCard title="Nhiệt độ"  value={`${temperature}°C`} icon="🌡️"
          color={temperature >= 35 ? '#ef4444' : '#f59e0b'} bg={temperature >= 35 ? '#fef2f2' : '#fffbeb'}
          sub={`Độ ẩm: ${humidity}%`} />
        <StatusCard title="Số người"  value={people} icon="👥" color="#0ea5e9" bg="#f0f9ff" sub="người" />
        <StatusCard title="Ánh sáng"  value={light === 'dark' ? 'Tối' : 'Sáng'} icon={light === 'dark' ? '🌙' : '☀️'}
          color={light === 'dark' ? '#8b5cf6' : '#f59e0b'} bg={light === 'dark' ? '#f5f3ff' : '#fffbeb'} />
        <StatusCard title="Khí gas"   value={gas === 1 ? 'Phát hiện!' : 'Bình thường'} icon={gas === 1 ? '⚠️' : '✅'}
          color={gas === 1 ? '#ef4444' : '#22c55e'} bg={gas === 1 ? '#fef2f2' : '#f0fdf4'} />
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Điều khiển thiết bị */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 280,
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Điều khiển thiết bị</h3>
          <ControlGroup
            title="💡 Đèn phòng khách"
            status={livingLed}
            onCmd={(cmd) => livingLedCmd(cmd).then(() => toast.success(`Đèn PK: ${cmd}`)).catch(() => toast.error('Lỗi!'))}
            activeColor="#f59e0b"
          />
          <ControlGroup
            title="💡 Đèn phòng ngủ"
            status={bedroomLed}
            onCmd={(cmd) => bedroomLedCmd(cmd).then(() => toast.success(`Đèn PN: ${cmd}`)).catch(() => toast.error('Lỗi!'))}
            activeColor="#f59e0b"
          />
          <ControlGroup
            title="🌀 Quạt"
            status={fanStatus}
            onCmd={(cmd) => fanCmd(cmd).then(() => toast.success(`Quạt: ${cmd}`)).catch(() => toast.error('Lỗi!'))}
            activeColor="#3b82f6"
          />
        </div>

        {/* Còi cảnh báo */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minWidth: 240, maxWidth: 320,
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>🚨 Còi cảnh báo</h3>
          <div style={{
            padding: 16, borderRadius: 12, marginBottom: 20,
            background: buzzer === 1 ? '#fef2f2' : '#f8fafc',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>
              {buzzer === 1 ? '🔔' : '🔕'}
            </div>
            <p style={{
              margin: 0, fontWeight: 600,
              color: buzzer === 1 ? '#ef4444' : '#94a3b8',
            }}>
              {buzzer === 1 ? 'Còi đang kêu!' : 'Còi đang tắt'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => handleAlert('INTRUDER')}
              disabled={alertLoading}
              style={{
                padding: '10px', borderRadius: 8, border: 'none',
                background: '#ef4444', color: '#fff',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              🚨 Kích hoạt cảnh báo
            </button>
            <button
              onClick={() => handleAlert('OFF')}
              disabled={alertLoading}
              style={{
                padding: '10px', borderRadius: 8, border: 'none',
                background: '#f1f5f9', color: '#64748b',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              🔕 Tắt còi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;