import { useState }   from 'react';
import { toast }      from 'react-hot-toast';
import { clothesCmd } from '../api/clothesApi';
import useDeviceStore from '../store/deviceStore';
import {
  Shirt, CloudRain, Sun, Home, Bot,
  ArrowUpRight, AlertTriangle, CheckCircle2,
  Wind, Droplets,
} from 'lucide-react';

/* ── Dot grid decoration ── */
const DotGrid = ({ cols = 6, rows = 4, style = {} }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 6px)`,
    gap: 6,
    ...style,
  }}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <span key={i} style={{
        width: 3, height: 3, borderRadius: '50%',
        background: '#FAC775', opacity: 0.45, display: 'block',
      }} />
    ))}
  </div>
);

/* ── Section header ── */
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 'var(--space-lg, 16px)' }}>
    <h2 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-heading, #1A1A1A)', margin: 0 }}>{title}</h2>
    {sub && <p style={{ fontSize: 11, color: 'var(--text-muted, #888780)', marginTop: 2, margin: 0 }}>{sub}</p>}
  </div>
);

/* ── Status pill ── */
const Pill = ({ color = 'amber', children }) => {
  const map = {
    amber:  { bg: '#FFF3DC', text: '#BA7517' },
    green:  { bg: '#EAFCE8', text: '#3B6D11' },
    blue:   { bg: '#E6F1FB', text: '#185FA5' },
    purple: { bg: '#EEEDFE', text: '#534AB7' },
    gray:   { bg: '#FAF8F4', text: '#888780' },
    red:    { bg: '#FCEBEB', text: '#A32D2D' },
  };
  const { bg, text } = map[color] || map.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 500, borderRadius: 9999,
      padding: '3px 10px', background: bg, color: text,
    }}>
      {children}
    </span>
  );
};

/* ── Arc gauge (servo position) ── */
const ServoArc = ({ position }) => {
  const pct   = position === 'out' ? 1 : 0;
  const r     = 52;
  const cx    = 70;
  const cy    = 70;
  const start = Math.PI * 0.75;
  const end   = Math.PI * 2.25;
  const total = end - start;

  const toXY = (angle) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const bgStart = toXY(start);
  const bgEnd   = toXY(end);
  const fillEnd = toXY(start + total * pct);

  const arcPath = (from, to, sweep) => {
    const f = toXY(from);
    const t = toXY(to);
    return `M ${f.x} ${f.y} A ${r} ${r} 0 ${sweep} 1 ${t.x} ${t.y}`;
  };

  return (
    <svg width={140} height={120} viewBox="0 0 140 120">
      {/* Track */}
      <path
        d={arcPath(start, end, 1)}
        fill="none"
        stroke="#EEECE8"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={arcPath(start, start + total * Math.max(pct, 0.001), pct > 0.5 ? 1 : 0)}
        fill="none"
        stroke={position === 'out' ? '#EF9F27' : '#85B7EB'}
        strokeWidth={8}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Center label */}
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        fontSize={11}
        fill="#888780"
        fontFamily="Inter, system-ui, sans-serif"
      >
        Servo
      </text>
      <text
        x={cx} y={cy + 12}
        textAnchor="middle"
        fontSize={13}
        fontWeight={500}
        fill="#1A1A1A"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {position === 'out' ? 'Mở' : 'Đóng'}
      </text>
      {/* Left label */}
      <text x={14} y={108} fontSize={9} fill="#B8B6B0" fontFamily="Inter, sans-serif">VÀO</text>
      {/* Right label */}
      <text x={108} y={108} fontSize={9} fill="#B8B6B0" fontFamily="Inter, sans-serif">RA</text>
    </svg>
  );
};

/* ── Control button ── */
const CtrlBtn = ({ icon, label, sub, accent = 'amber', onClick, disabled, loading }) => {
  const accentMap = {
    amber:  { bg: '#EF9F27', light: '#FFF3DC', border: '#FAE8B8', text: '#BA7517' },
    blue:   { bg: '#378ADD', light: '#E6F1FB', border: '#B5D4F4', text: '#185FA5' },
    purple: { bg: '#7F77DD', light: '#EEEDFE', border: '#CECBF6', text: '#534AB7' },
  };
  const { bg, light, border, text } = accentMap[accent] || accentMap.amber;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderRadius: 14,
        border: `1px solid ${disabled ? '#EEECE8' : border}`,
        background: disabled ? '#FAF8F4' : light,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.18s',
        opacity: disabled ? 0.55 : 1,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = bg;
          e.currentTarget.style.borderColor = bg;
          e.currentTarget.querySelector('.btn-icon').style.color = '#fff';
          e.currentTarget.querySelector('.btn-label').style.color = '#fff';
          e.currentTarget.querySelector('.btn-sub').style.color = 'rgba(255,255,255,0.75)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = light;
          e.currentTarget.style.borderColor = border;
          e.currentTarget.querySelector('.btn-icon').style.color = text;
          e.currentTarget.querySelector('.btn-label').style.color = '#1A1A1A';
          e.currentTarget.querySelector('.btn-sub').style.color = '#888780';
        }
      }}
    >
      <div className="btn-icon" style={{
        width: 38, height: 38, borderRadius: 11,
        background: 'rgba(255,255,255,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? '#B8B6B0' : text,
        flexShrink: 0,
        transition: 'color 0.18s',
      }}>
        {loading
          ? <span style={{
              width: 14, height: 14,
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'block',
              animation: 'spin 0.7s linear infinite',
            }} />
          : icon}
      </div>
      <div>
        <div className="btn-label" style={{
          fontSize: 13, fontWeight: 500,
          color: disabled ? '#B8B6B0' : '#1A1A1A',
          transition: 'color 0.18s',
        }}>
          {label}
        </div>
        <div className="btn-sub" style={{
          fontSize: 11, color: disabled ? '#D0CEC8' : '#888780',
          marginTop: 2, transition: 'color 0.18s',
        }}>
          {sub}
        </div>
      </div>
    </button>
  );
};

/* ── Info row ── */
const InfoRow = ({ label, value, accent = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #EEECE8',
  }}>
    <span style={{ fontSize: 12, color: '#888780' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 500, color: accent ? '#EF9F27' : '#1A1A1A' }}>{value}</span>
  </div>
);

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

  const isRaining   = rainStatus === 'raining';
  const isClothesIn = clothesStatus === 'in';

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease' }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em' }}>
              Giàn phơi thông minh
            </h1>
            <p style={{ fontSize: 12, color: '#B8B6B0', marginTop: 3 }}>Servo motor · Cảm biến mưa tự động</p>
          </div>
          <Pill color={isRaining ? 'blue' : 'green'}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'currentColor', display: 'inline-block',
              animation: isRaining ? 'pulse 1.5s infinite' : 'none',
            }} />
            {isRaining ? 'Đang có mưa' : 'Trời quang'}
          </Pill>
        </div>

        {/* ── Rain warning banner ── */}
        {isRaining && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#E6F1FB', border: '1px solid #B5D4F4',
            borderRadius: 12, padding: '13px 18px',
            color: '#185FA5', fontSize: 13, fontWeight: 500,
            animation: 'pulse 2s infinite',
          }}>
            <AlertTriangle size={16} strokeWidth={1.5} />
            Đang mưa — hệ thống đã tự động thu giàn phơi vào. Không thể đẩy ra lúc này.
          </div>
        )}

        {/* ── Main grid ── */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

          {/* Status card */}
          <div style={{
            flex: 1, minWidth: 260,
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #EEECE8',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <DotGrid cols={5} rows={4} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.7 }} />

            <SectionHeader title="Trạng thái hiện tại" sub="Cập nhật thời gian thực" />

            {/* Big status display */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 24px' }}>
              {/* Arc gauge */}
              <ServoArc position={isClothesIn ? 'in' : 'out'} />

              {/* Main icon */}
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: isRaining ? '#E6F1FB' : isClothesIn ? '#FFF3DC' : '#EAFCE8',
                border: `1px solid ${isRaining ? '#B5D4F4' : isClothesIn ? '#FAE8B8' : '#C0DD97'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isRaining ? '#185FA5' : isClothesIn ? '#EF9F27' : '#3B6D11',
                marginBottom: 14,
              }}>
                {isRaining
                  ? <CloudRain size={28} strokeWidth={1.5} />
                  : isClothesIn
                    ? <Home size={28} strokeWidth={1.5} />
                    : <Sun size={28} strokeWidth={1.5} />
                }
              </div>

              <div style={{ fontSize: 17, fontWeight: 500, color: '#1A1A1A', marginBottom: 6, textAlign: 'center' }}>
                {isRaining ? 'Đang có mưa' : isClothesIn ? 'Giàn đã thu vào' : 'Đang phơi ngoài'}
              </div>
              <div style={{ fontSize: 12, color: '#888780', textAlign: 'center', lineHeight: 1.6 }}>
                {isRaining
                  ? 'Hệ thống tự động thu giàn phơi để bảo vệ quần áo'
                  : isClothesIn
                    ? 'Quần áo đang ở trong nhà, an toàn'
                    : 'Quần áo đang được phơi ngoài trời nắng'}
              </div>
            </div>

            {/* Info rows */}
            <div>
              <InfoRow label="Cảm biến mưa" value={isRaining ? 'Phát hiện mưa' : 'Không có mưa'} accent={isRaining} />
              <InfoRow label="Vị trí giàn" value={isClothesIn ? 'Trong nhà' : 'Ngoài trời'} />
              <InfoRow label="Chế độ" value="Tự động + Thủ công" />
              <div style={{ paddingTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Pill color={isRaining ? 'blue' : 'green'}>
                  {isRaining ? <CloudRain size={10} strokeWidth={1.5} /> : <Sun size={10} strokeWidth={1.5} />}
                  {isRaining ? 'Mưa' : 'Nắng'}
                </Pill>
                <Pill color={isClothesIn ? 'amber' : 'green'}>
                  <Shirt size={10} strokeWidth={1.5} />
                  {isClothesIn ? 'Đã vào' : 'Đang phơi'}
                </Pill>
              </div>
            </div>
          </div>

          {/* Control card */}
          <div style={{
            flex: 1, minWidth: 260,
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #EEECE8',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 24,
          }}>
            <SectionHeader title="Điều khiển thủ công" sub="Gửi lệnh trực tiếp đến servo motor" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <CtrlBtn
                icon={<ArrowUpRight size={18} strokeWidth={1.5} />}
                label="Đẩy ra ngoài"
                sub={isRaining ? 'Không khả dụng khi trời mưa' : 'Mở giàn phơi ra ngoài trời'}
                accent="amber"
                onClick={() => handleCmd('OUT')}
                disabled={isRaining}
                loading={loading === 'OUT'}
              />
              <CtrlBtn
                icon={<Home size={18} strokeWidth={1.5} />}
                label="Thu vào trong"
                sub="Kéo giàn phơi vào trong nhà"
                accent="blue"
                onClick={() => handleCmd('IN')}
                loading={loading === 'IN'}
              />
              <CtrlBtn
                icon={<Bot size={18} strokeWidth={1.5} />}
                label="Chế độ tự động"
                sub="Hệ thống tự điều chỉnh theo cảm biến mưa"
                accent="purple"
                onClick={() => handleCmd('AUTO')}
                loading={loading === 'AUTO'}
              />
            </div>

            {/* Note */}
            <div style={{
              marginTop: 20,
              padding: '12px 14px',
              borderRadius: 12,
              background: '#FAF8F4',
              border: '1px solid #EEECE8',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#888780', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Lưu ý
              </div>
              <p style={{ fontSize: 12, color: '#888780', margin: 0, lineHeight: 1.7 }}>
                Chế độ <strong style={{ color: '#444340' }}>AUTO</strong> sẽ tự động thu giàn khi phát hiện mưa và đẩy ra khi trời quang. Lệnh thủ công sẽ ghi đè tạm thời.
              </p>
            </div>
          </div>

        </div>

        {/* ── Weather summary row ── */}
        <section>
          <SectionHeader title="Thông tin môi trường" sub="Dữ liệu cảm biến liên quan" />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              {
                icon: <CloudRain size={16} strokeWidth={1.5} />,
                label: 'Cảm biến mưa',
                value: isRaining ? 'Đang mưa' : 'Trời tạnh',
                color: isRaining ? 'blue' : 'green',
              },
              {
                icon: <Shirt size={16} strokeWidth={1.5} />,
                label: 'Giàn phơi',
                value: isClothesIn ? 'Đã thu vào' : 'Đang phơi',
                color: isClothesIn ? 'amber' : 'green',
              },
              {
                icon: <Wind size={16} strokeWidth={1.5} />,
                label: 'Servo motor',
                value: 'Hoạt động',
                color: 'gray',
              },
              {
                icon: <CheckCircle2 size={16} strokeWidth={1.5} />,
                label: 'Hệ thống',
                value: 'Sẵn sàng',
                color: 'green',
              },
            ].map(({ icon, label, value, color }) => {
              const colorMap = {
                amber:  { bg: '#FFF3DC', border: '#FAE8B8', iconColor: '#EF9F27' },
                green:  { bg: '#EAFCE8', border: '#C0DD97', iconColor: '#3B6D11' },
                blue:   { bg: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5' },
                gray:   { bg: '#FAF8F4', border: '#EEECE8', iconColor: '#888780' },
              };
              const { bg, border, iconColor } = colorMap[color] || colorMap.gray;
              return (
                <div key={label} style={{
                  flex: 1, minWidth: 140,
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #EEECE8',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: bg, border: `1px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: iconColor, flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#B8B6B0', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', marginTop: 2 }}>{value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
};

export default ClothesPage;