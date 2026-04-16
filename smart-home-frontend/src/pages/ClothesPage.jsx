import { useState }   from 'react';
import { toast }      from 'react-hot-toast';
import { clothesCmd } from '../api/clothesApi';
import useDeviceStore from '../store/deviceStore';

const ClothesPage = () => {
  const { clothesStatus, rainStatus } = useDeviceStore();
  const [loading, setLoading]         = useState('');

  const handleCmd = async (cmd) => {
    setLoading(cmd);
    try {
      await clothesCmd(cmd);
      toast.success(`Đã gửi lệnh: ${cmd}`);
    } catch { toast.error('Gửi lệnh thất bại!'); }
    finally  { setLoading(''); }
  };

  const buttons = [
    { cmd: 'OUT',  label: '☀️ Đẩy ra',    color: '#22c55e', disabled: rainStatus === 'raining' },
    { cmd: 'IN',   label: '🏠 Thu vào',    color: '#3b82f6', disabled: false },
    { cmd: 'AUTO', label: '🤖 Tự động',    color: '#8b5cf6', disabled: false },
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
        Giàn phơi thông minh
      </h2>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Trạng thái */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 260,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>
            {rainStatus === 'raining' ? '🌧️' : clothesStatus === 'in' ? '🏠' : '☀️'}
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
            {rainStatus === 'raining'
              ? 'Đang có mưa'
              : clothesStatus === 'in' ? 'Giàn đang thu vào' : 'Giàn đang phơi'}
          </h3>
          <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
            {rainStatus === 'raining'
              ? 'Hệ thống tự động thu giàn phơi'
              : clothesStatus === 'in' ? 'Quần áo đã được thu vào trong' : 'Quần áo đang được phơi ngoài'}
          </p>

          {/* Trạng thái mưa */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 20,
            background: rainStatus === 'raining' ? '#eff6ff' : '#f0fdf4',
            color:      rainStatus === 'raining' ? '#3b82f6' : '#22c55e',
            fontWeight: 600, fontSize: 13,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: rainStatus === 'raining' ? '#3b82f6' : '#22c55e',
            }} />
            Cảm biến mưa: {rainStatus === 'raining' ? 'Đang mưa' : 'Trời tạnh'}
          </div>
        </div>

        {/* Điều khiển */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 260,
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Điều khiển thủ công</h3>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 13 }}>
            Chế độ AUTO: hệ thống tự động theo cảm biến mưa.
          </p>

          {rainStatus === 'raining' && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: '#fffbeb', color: '#f59e0b',
              fontSize: 13, fontWeight: 500,
            }}>
              ⚠️ Đang mưa — không thể đẩy giàn ra
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {buttons.map(({ cmd, label, color, disabled }) => (
              <button
                key={cmd}
                onClick={() => handleCmd(cmd)}
                disabled={loading !== '' || disabled}
                style={{
                  padding: '12px', borderRadius: 10, border: 'none',
                  background: disabled || loading !== '' ? '#f1f5f9' : color,
                  color: disabled || loading !== '' ? '#94a3b8' : '#fff',
                  fontWeight: 600, fontSize: 14,
                  cursor: disabled || loading !== '' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading === cmd ? '⏳ Đang xử lý...' : label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothesPage;