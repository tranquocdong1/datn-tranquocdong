import { useState, useEffect, useCallback } from 'react';
import { getLogs } from '../api/statsApi';

const DEVICES = ['all', 'door', 'room', 'rain', 'security'];
const BADGE   = {
  access_granted:  { bg: '#f0fdf4', color: '#22c55e', label: '✅ Cho phép' },
  access_denied:   { bg: '#fef2f2', color: '#ef4444', label: '❌ Từ chối' },
  uid_scanned:     { bg: '#f0f9ff', color: '#0ea5e9', label: '🪪 Quét thẻ' },
  gas_detected:    { bg: '#fffbeb', color: '#f59e0b', label: '⚠️ Gas' },
  intruder_alert:  { bg: '#fdf4ff', color: '#a855f7', label: '🚨 Xâm nhập' },
  high_temperature:{ bg: '#fef2f2', color: '#ef4444', label: '🌡️ Nhiệt cao' },
  rain_detected:   { bg: '#eff6ff', color: '#3b82f6', label: '🌧️ Mưa' },
  dht_record:      { bg: '#f8fafc', color: '#64748b', label: '📊 DHT' },
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
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
        Lịch sử hoạt động
      </h2>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {DEVICES.map((d) => (
          <button key={d} onClick={() => setDevice(d)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none',
            background: device === d ? '#3b82f6' : '#f1f5f9',
            color:      device === d ? '#fff'    : '#64748b',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            {d === 'all' ? 'Tất cả' : d}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', lineHeight: '34px' }}>
          {total} bản ghi
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Thời gian', 'Thiết bị', 'Sự kiện', 'Chi tiết'].map((h) => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 13, fontWeight: 600, color: '#64748b',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                Đang tải...
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                Không có dữ liệu
              </td></tr>
            ) : logs.map((log) => {
              const badge = BADGE[log.event] || { bg: '#f8fafc', color: '#64748b', label: log.event };
              return (
                <tr key={log._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                    {new Date(log.createdAt).toLocaleString('vi')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 10,
                      background: '#f1f5f9', color: '#475569',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {log.device}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 10,
                      background: badge.bg, color: badge.color,
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                    {log.payload ? JSON.stringify(log.payload) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 8, padding: 16, borderTop: '1px solid #f1f5f9',
          }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: '#f1f5f9', color: '#64748b', cursor: 'pointer',
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              ← Trước
            </button>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: '#f1f5f9', color: '#64748b', cursor: 'pointer',
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;