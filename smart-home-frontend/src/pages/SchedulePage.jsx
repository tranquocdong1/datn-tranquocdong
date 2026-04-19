import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getSchedules, createSchedule,
  updateSchedule, toggleSchedule,
  deleteSchedule,
} from '../api/scheduleApi';
import { Clock, Plus, Trash2, Pencil, Power } from 'lucide-react';

const DAYS    = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DEVICES = [
  { value: 'fan',         label: '🌀 Quạt'            },
  { value: 'living_led',  label: '💡 Đèn phòng khách'  },
  { value: 'bedroom_led', label: '💡 Đèn phòng ngủ'    },
  { value: 'clothes',     label: '👕 Giàn phơi'         },
  { value: 'door',        label: '🚪 Cửa chính'         },
];
const ACTIONS = {
  fan:         ['ON', 'OFF', 'AUTO'],
  living_led:  ['ON', 'OFF', 'AUTO'],
  bedroom_led: ['ON', 'OFF'],
  clothes:     ['IN', 'OUT', 'AUTO'],
  door:        ['OPEN', 'CLOSE'],
};
const ACTION_LABEL = {
  ON: 'Bật', OFF: 'Tắt', AUTO: 'Tự động',
  IN: 'Thu vào', OUT: 'Đẩy ra',
  OPEN: 'Mở', CLOSE: 'Đóng',
};
const ACTION_COLOR = {
  ON:    'var(--success-text)',
  OFF:   'var(--text-muted)',
  AUTO:  '#8B5CF6',
  IN:    '#3B82F6',
  OUT:   'var(--success-text)',
  OPEN:  'var(--warning-text)',
  CLOSE: 'var(--success-text)',
};
const ACTION_BG = {
  ON:    'var(--success-bg)',
  OFF:   'var(--bg-muted)',
  AUTO:  '#F5F3FF',
  IN:    '#EFF6FF',
  OUT:   'var(--success-bg)',
  OPEN:  'var(--warning-bg)',
  CLOSE: 'var(--success-bg)',
};

const EMPTY_FORM = {
  name: '', device: 'fan', action: 'ON',
  hour: 6, minute: 0, days: [1,2,3,4,5], enabled: true,
};

// ── Shared style tokens ──────────────────────────────────────────────────────
const COLOR = {
  bg:         'var(--bg-base)',
  card:       'var(--bg-card)',
  border:     'var(--border-default)',
  accent:     'var(--accent-primary)',
  accentLight:'var(--accent-light)',
  accentBg:   'var(--accent-pale)',
  text:       'var(--text-heading)',
  muted:      'var(--text-muted)',
  hint:       'var(--text-hint)',
};

const cardStyle = {
  background:   COLOR.card,
  borderRadius: 18,
  boxShadow:    'var(--shadow-card)',
  border:       '1px solid var(--border-default)',
};

const inputStyle = {
  width:        '100%',
  padding:      '9px 13px',
  borderRadius: 10,
  border:       '1px solid var(--border-default)',
  fontSize:     13,
  outline:      'none',
  boxSizing:    'border-box',
  color:        COLOR.text,
  background:   'var(--bg-muted)',
  fontFamily:   'inherit',
};

const labelStyle = {
  fontSize:      11,
  fontWeight:    400,
  color:         COLOR.muted,
  display:       'block',
  marginBottom:  6,
  letterSpacing: '0.5px',
};
// ────────────────────────────────────────────────────────────────────────────

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [loading,   setLoading]   = useState(false);

  const fetchSchedules = async () => {
    try {
      const res = await getSchedules();
      setSchedules(res.data);
    } catch { toast.error('Lỗi tải danh sách lịch!'); }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleDeviceChange = (device) => {
    setForm((f) => ({ ...f, device, action: ACTIONS[device][0] }));
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter((d) => d !== day)
        : [...f.days, day].sort((a, b) => a - b),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nhập tên lịch!');
    if (!form.days.length) return toast.error('Chọn ít nhất 1 ngày!');

    setLoading(true);
    try {
      if (editId) {
        await updateSchedule(editId, form);
        toast.success('Đã cập nhật lịch!');
      } else {
        await createSchedule(form);
        toast.success('Đã tạo lịch mới!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, device: s.device, action: s.action,
      hour: s.hour, minute: s.minute, days: s.days, enabled: s.enabled,
    });
    setEditId(s._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleSchedule(id);
      setSchedules((prev) =>
        prev.map((s) => s._id === id ? { ...s, enabled: res.data.enabled } : s)
      );
    } catch { toast.error('Lỗi!'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa lịch "${name}"?`)) return;
    try {
      await deleteSchedule(id);
      toast.success('Đã xóa!');
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch { toast.error('Lỗi xóa lịch!'); }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={{ background: COLOR.bg, minHeight: '100vh', padding: '0 0 40px' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '28px 28px 0',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 300, color: COLOR.text, letterSpacing: '-0.3px' }}>
            Hẹn giờ tự động
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: COLOR.muted, letterSpacing: '0.6px' }}>
            LỊCH CHẠY THEO GIỜ · GỬI LỆNH TỰ ĐỘNG
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 50, border: 'none',
            background: COLOR.accent, color: 'var(--bg-card)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            letterSpacing: '0.2px', transition: 'background 0.2s',
          }}
        >
          <Plus size={14} strokeWidth={1.5} />
          Tạo lịch mới
        </button>
      </div>

      {/* ── Form tạo / chỉnh sửa ── */}
      {showForm && (
        <div style={{ padding: '20px 28px 0' }}>
          <div style={{ ...cardStyle, padding: 28, position: 'relative', overflow: 'hidden' }}>

            {/* Dot texture decoration */}
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.07, pointerEvents: 'none' }}
              width="140" height="90" viewBox="0 0 140 90">
              <defs>
                <pattern id="dp" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="var(--accent-primary)" />
                </pattern>
              </defs>
              <rect width="140" height="90" fill="url(#dp)" />
            </svg>

            <h3 style={{ margin: '0 0 22px', fontSize: 14, fontWeight: 500, color: COLOR.text, letterSpacing: '0.1px' }}>
              {editId ? '✏️ Chỉnh sửa lịch' : '➕ Tạo lịch mới'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>

                {/* Tên lịch */}
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label style={labelStyle}>TÊN LỊCH</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Bật đèn buổi tối"
                  />
                </div>

                {/* Thiết bị */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={labelStyle}>THIẾT BỊ</label>
                  <select
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23888780' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
                    value={form.device}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                  >
                    {DEVICES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Lệnh */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={labelStyle}>LỆNH</label>
                  <select
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23888780' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
                    value={form.action}
                    onChange={(e) => setForm({ ...form, action: e.target.value })}
                  >
                    {ACTIONS[form.device].map((a) => (
                      <option key={a} value={a}>{ACTION_LABEL[a]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giờ & Phút */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={labelStyle}>GIỜ (0–23)</label>
                  <input
                    type="number" min={0} max={23}
                    style={{ ...inputStyle, width: 90 }}
                    value={form.hour}
                    onChange={(e) => setForm({ ...form, hour: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>PHÚT (0–59)</label>
                  <input
                    type="number" min={0} max={59}
                    style={{ ...inputStyle, width: 90 }}
                    value={form.minute}
                    onChange={(e) => setForm({ ...form, minute: parseInt(e.target.value) || 0 })}
                  />
                </div>
                {/* Time badge */}
                <div style={{
                  padding: '10px 20px',
                  background: COLOR.accentBg,
                  border: '1px solid var(--accent-light)',
                  borderRadius: 10,
                  color: COLOR.accent,
                  fontWeight: 300,
                  fontSize: 22,
                  letterSpacing: 2,
                }}>
                  {pad(form.hour)}:{pad(form.minute)}
                </div>
              </div>

              {/* Ngày trong tuần */}
              <div style={{ marginBottom: 26 }}>
                <label style={labelStyle}>NGÀY ÁP DỤNG</label>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none',
                        background: form.days.includes(i) ? COLOR.accent : 'var(--bg-muted)',
                        color:      form.days.includes(i) ? 'var(--bg-card)' : COLOR.muted,
                        fontWeight: 500, fontSize: 11, cursor: 'pointer',
                        transition: 'all 0.15s', letterSpacing: 0,
                      }}
                    >
                      {d}
                    </button>
                  ))}
                  {/* Quick-select pills */}
                  {[
                    { label: 'T2–T6',     days: [1,2,3,4,5],     bg: 'var(--success-bg)',  color: 'var(--success-text)' },
                    { label: 'Cuối tuần', days: [0,6],            bg: 'var(--accent-pale)', color: 'var(--warning-text)' },
                    { label: 'Hàng ngày', days: [0,1,2,3,4,5,6], bg: 'var(--bg-muted)',    color: 'var(--text-muted)'   },
                  ].map(({ label, days, bg, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, days }))}
                      style={{
                        padding: '0 13px', height: 32, borderRadius: 50,
                        border: 'none', background: bg, color,
                        fontSize: 11, fontWeight: 500, cursor: 'pointer',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={loading} style={{
                  padding: '10px 26px', borderRadius: 50, border: 'none',
                  background: loading ? COLOR.hint : COLOR.accent, color: 'var(--bg-card)',
                  fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.2px',
                }}>
                  {loading ? '⏳ Đang lưu...' : editId ? '💾 Cập nhật' : '✅ Tạo lịch'}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
                  style={{
                    padding: '10px 20px', borderRadius: 50,
                    border: '1px solid var(--border-default)', background: 'var(--bg-card)',
                    color: COLOR.muted, fontSize: 13, cursor: 'pointer',
                  }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Danh sách lịch ── */}
      <div style={{ padding: '20px 28px 0' }}>
        {schedules.length === 0 ? (
          <div style={{ ...cardStyle, padding: 60, textAlign: 'center', color: COLOR.hint }}>
            <Clock size={40} strokeWidth={1.5} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: COLOR.muted }}>
              Chưa có lịch nào. Nhấn "Tạo lịch mới" để bắt đầu!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {schedules.map((s) => (
              <div key={s._id} style={{
                ...cardStyle,
                padding: '18px 24px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                opacity: s.enabled ? 1 : 0.45,
                transition: 'opacity 0.2s',
              }}>

                {/* Giờ */}
                <div style={{
                  minWidth: 68, textAlign: 'center',
                  background: s.enabled ? 'var(--accent-pale)' : 'var(--bg-muted)',
                  border: `1px solid ${s.enabled ? 'var(--accent-pale-border)' : 'var(--border-default)'}`,
                  borderRadius: 12, padding: '10px 8px',
                }}>
                  <div style={{
                    fontSize: 19, fontWeight: 300,
                    color: s.enabled ? COLOR.accent : COLOR.hint,
                    letterSpacing: 1,
                  }}>
                    {pad(s.hour)}:{pad(s.minute)}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: COLOR.text, marginBottom: 4 }}>
                    {s.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: COLOR.muted, letterSpacing: '0.3px' }}>
                      {DEVICES.find((d) => d.value === s.device)?.label}
                    </span>
                    <span style={{ color: COLOR.border, fontSize: 14 }}>•</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 10px',
                      borderRadius: 50, letterSpacing: '0.3px',
                      background: ACTION_BG[s.action],
                      color: ACTION_COLOR[s.action],
                    }}>
                      {ACTION_LABEL[s.action]}
                    </span>
                  </div>
                </div>

                {/* Ngày */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {DAYS.map((d, i) => (
                    <span key={i} style={{
                      width: 26, height: 26, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 500,
                      background: s.days.includes(i) ? COLOR.accent : 'var(--bg-muted)',
                      color:      s.days.includes(i) ? 'var(--bg-card)' : COLOR.hint,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* lastRanAt */}
                <div style={{ fontSize: 10, color: COLOR.hint, minWidth: 90, textAlign: 'right', letterSpacing: '0.3px', lineHeight: 1.5 }}>
                  {s.lastRanAt
                    ? `Lần cuối:\n${new Date(s.lastRanAt).toLocaleString('vi')}`
                    : 'Chưa chạy'}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 7 }}>
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(s._id)}
                    title={s.enabled ? 'Tắt lịch' : 'Bật lịch'}
                    style={{
                      width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: s.enabled ? 'var(--success-bg)' : 'var(--bg-muted)',
                      color:      s.enabled ? 'var(--success-text)' : COLOR.hint,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Power size={14} strokeWidth={1.5} />
                  </button>
                  {/* Sửa */}
                  <button
                    onClick={() => handleEdit(s)}
                    title="Chỉnh sửa"
                    style={{
                      width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: COLOR.accentBg, color: COLOR.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                  {/* Xóa */}
                  <button
                    onClick={() => handleDelete(s._id, s.name)}
                    title="Xóa"
                    style={{
                      width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'var(--danger-bg)', color: 'var(--danger-text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;