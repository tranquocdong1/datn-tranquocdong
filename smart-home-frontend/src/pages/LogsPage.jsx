import { useState, useEffect, useCallback } from 'react';
import { getLogs } from '../api/statsApi';
import {
  ShieldCheck, ShieldAlert, CreditCard, Flame,
  AlertTriangle, Thermometer, CloudRain, BarChart2,
  ChevronLeft, ChevronRight, Inbox,
} from 'lucide-react';

const DEVICES = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'door',     label: 'Cửa' },
  { key: 'room',     label: 'Phòng' },
  { key: 'rain',     label: 'Mưa' },
  { key: 'security', label: 'Bảo mật' },
];

const BADGE = {
  access_granted:   { bg: 'var(--success-bg)',  color: 'var(--success-text)', icon: ShieldCheck,   label: 'Cho phép' },
  access_denied:    { bg: 'var(--danger-bg)',   color: 'var(--danger-text)',  icon: ShieldAlert,   label: 'Từ chối' },
  uid_scanned:      { bg: '#E6F1FB',            color: '#185FA5',             icon: CreditCard,    label: 'Quét thẻ' },
  gas_detected:     { bg: 'var(--accent-pale)', color: 'var(--warning-text)', icon: Flame,         label: 'Phát hiện gas' },
  intruder_alert:   { bg: '#EEEDFE',            color: '#534AB7',             icon: AlertTriangle, label: 'Xâm nhập' },
  high_temperature: { bg: 'var(--danger-bg)',   color: 'var(--danger-text)',  icon: Thermometer,   label: 'Nhiệt cao' },
  rain_detected:    { bg: '#E6F1FB',            color: '#185FA5',             icon: CloudRain,     label: 'Phát hiện mưa' },
  dht_record:       { bg: 'var(--bg-muted)',    color: 'var(--text-muted)',   icon: BarChart2,     label: 'DHT record' },
};

const DEVICE_COLORS = {
  door:     { bg: 'var(--accent-pale)',  color: 'var(--warning-text)' },
  room:     { bg: 'var(--success-bg)',   color: 'var(--success-text)' },
  rain:     { bg: '#E6F1FB',            color: '#185FA5' },
  security: { bg: '#EEEDFE',            color: '#534AB7' },
};

const LogsPage = () => {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [device,  setDevice]  = useState('all');
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit, page, ...(device !== 'all' && { device }) };
      const res    = await getLogs(params);
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, device]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [device]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-heading)', margin: 0 }}>
            Lịch sử hoạt động
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 3 }}>
            Nhật ký sự kiện từ tất cả các thiết bị
          </p>
        </div>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 14px',
          fontWeight: 500,
        }}>
          {total} bản ghi
        </span>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
        padding: 6,
      }}>
        {DEVICES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setDevice(key)}
            style={{
              padding: '7px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: device === key ? 'var(--accent-pale)' : 'transparent',
              color:      device === key ? 'var(--warning-text)' : 'var(--text-muted)',
              fontWeight: device === key ? 500 : 400,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              outline: device === key ? '1px solid var(--accent-pale-border)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Table card ── */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-muted)' }}>
              {['Thời gian', 'Thiết bị', 'Sự kiện', 'Chi tiết'].map((h) => (
                <th key={h} style={{
                  padding: '11px 16px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border-default)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: 'var(--text-hint)',
                  fontSize: 13,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid var(--accent-light)',
                      borderTopColor: 'var(--accent-primary)',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  textAlign: 'center',
                  padding: '56px 0',
                  color: 'var(--text-hint)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Inbox size={32} strokeWidth={1} style={{ color: 'var(--text-hint)' }} />
                    <span style={{ fontSize: 13 }}>Không có dữ liệu</span>
                  </div>
                </td>
              </tr>
            ) : logs.map((log, idx) => {
              const badge  = BADGE[log.event]  || { bg: 'var(--bg-muted)', color: 'var(--text-muted)', icon: BarChart2, label: log.event };
              const devClr = DEVICE_COLORS[log.device] || { bg: 'var(--bg-muted)', color: 'var(--text-muted)' };
              const BadgeIcon = badge.icon;
              const isLast = idx === logs.length - 1;

              return (
                <tr
                  key={log._id}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--border-default)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Thời gian */}
                  <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-body)', fontWeight: 400 }}>
                      {new Date(log.createdAt).toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 1 }}>
                      {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  {/* Thiết bị */}
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: devClr.bg,
                      color: devClr.color,
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                      {log.device}
                    </span>
                  </td>

                  {/* Sự kiện */}
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: badge.bg,
                      color: badge.color,
                      fontSize: 11,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}>
                      <BadgeIcon size={11} strokeWidth={1.8} />
                      {badge.label}
                    </span>
                  </td>

                  {/* Chi tiết */}
                  <td style={{ padding: '11px 16px', maxWidth: 260 }}>
                    {log.payload ? (
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px 8px',
                        display: 'inline-block',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {JSON.stringify(log.payload)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-hint)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-muted)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Trang {page} / {totalPages} · {total} bản ghi
            </span>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-body)',
                  fontSize: 12, fontWeight: 500,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <ChevronLeft size={13} strokeWidth={1.5} />
                Trước
              </button>

              {/* Page number pills */}
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 30, height: 30,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid',
                        borderColor: page === p ? 'var(--accent-pale-border)' : 'var(--border-default)',
                        background: page === p ? 'var(--accent-pale)' : 'var(--bg-card)',
                        color: page === p ? 'var(--warning-text)' : 'var(--text-muted)',
                        fontSize: 12, fontWeight: page === p ? 500 : 400,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-body)',
                  fontSize: 12, fontWeight: 500,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                Sau
                <ChevronRight size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LogsPage;