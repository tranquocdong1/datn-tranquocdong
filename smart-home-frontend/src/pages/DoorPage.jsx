import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sendDoorCmd, learnMode, removeUID, listUID, addUID } from '../api/doorApi';
import useDeviceStore from '../store/deviceStore';
import {
  DoorOpen, DoorClosed, CreditCard, Plus, Trash2,
  Nfc, ShieldCheck, ShieldAlert, Clock, Lock, Unlock,
} from 'lucide-react';

/* ─── Small helpers ─── */
const Divider = () => (
  <div style={{ height: 1, background: 'var(--border-default)', margin: '16px 0' }} />
);

const ActionButton = ({ label, onClick, disabled, variant = 'default', loading, icon }) => {
  const variants = {
    default: {
      background: 'var(--bg-muted)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-default)',
    },
    primary: {
      background: 'var(--accent-primary)',
      color: '#fff',
      border: '1px solid var(--accent-primary)',
    },
    danger: {
      background: 'var(--danger-bg)',
      color: 'var(--danger-text)',
      border: '1px solid #F09595',
    },
    success: {
      background: 'var(--success-bg)',
      color: 'var(--success-text)',
      border: '1px solid #9FE1CB',
    },
  };
  const s = variants[variant] ?? variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '9px 18px',
        borderRadius: 'var(--radius-md)',
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        ...s,
      }}
    >
      {icon && icon}
      {loading ? 'Đang xử lý...' : label}
    </button>
  );
};

const DoorPage = () => {
  const { doorStatus, lastAccess, lastUID, uidList } = useDeviceStore();
  const [loading,   setLoading]   = useState('');
  const [manualUID, setManualUID] = useState('');

  useEffect(() => { listUID(); }, []);

  const isOpen = doorStatus === 'open';

  const handleDoor = async (cmd) => {
    setLoading(cmd);
    try {
      await sendDoorCmd(cmd);
      toast.success(`Đã gửi lệnh ${cmd === 'OPEN' ? 'mở cửa' : 'đóng cửa'}`);
    } catch {
      toast.error('Gửi lệnh thất bại!');
    } finally {
      setLoading('');
    }
  };

  const handleLearn = async () => {
    setLoading('learn');
    try {
      await learnMode();
      toast('Đang chờ quẹt thẻ mới... (10 giây)', { icon: '🪪' });
    } catch {
      toast.error('Lỗi kích hoạt chế độ học!');
    } finally {
      setLoading('');
    }
  };

  const handleAddManual = async () => {
    const uid = manualUID.trim();
    if (!uid) return toast.error('Vui lòng nhập UID!');
    setLoading('addManual');
    try {
      await addUID(uid);
      toast.success(`Đã thêm thẻ ${uid}`);
      setManualUID('');
    } catch {
      toast.error('Thêm thẻ thất bại!');
    } finally {
      setLoading('');
    }
  };

  const handleRemove = async (uid) => {
    if (!window.confirm(`Xóa thẻ ${uid}?`)) return;
    try {
      await removeUID(uid);
      toast.success('Đã xóa thẻ');
    } catch {
      toast.error('Xóa thẻ thất bại!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>

      {/* ── Page header ── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-heading)', margin: 0 }}>
          Quản lý cửa &amp; thẻ RFID
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 3 }}>
          Điều khiển khóa điện từ và danh sách thẻ xác thực
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── LEFT: Door control ── */}
        <div style={{
          flex: 1,
          minWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',
        }}>

          {/* Status hero card */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--space-2xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            textAlign: 'center',
          }}>
            {/* Door icon circle */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: isOpen ? 'var(--accent-pale)' : 'var(--success-bg)',
              border: `2px solid ${isOpen ? 'var(--accent-light)' : '#9FE1CB'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isOpen ? 'var(--accent-primary)' : 'var(--success-text)',
            }}>
              {isOpen
                ? <DoorOpen   size={32} strokeWidth={1.2} />
                : <DoorClosed size={32} strokeWidth={1.2} />}
            </div>

            <div>
              <div style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-heading)' }}>
                {isOpen ? 'Đang mở' : 'Đã đóng'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Khóa điện từ · Cửa chính
              </div>
            </div>

            {/* Status pill */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 500,
              borderRadius: 999,
              padding: '4px 14px',
              background: isOpen ? 'var(--warning-bg)' : 'var(--success-bg)',
              color:      isOpen ? 'var(--warning-text)' : 'var(--success-text)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isOpen ? 'var(--warning-text)' : 'var(--success-text)',
              }} />
              {isOpen ? 'Không khóa' : 'Đã khóa an toàn'}
            </span>

            {/* Control buttons */}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <ActionButton
                label="Mở cửa"
                icon={<Unlock size={14} strokeWidth={1.5} />}
                variant="primary"
                onClick={() => handleDoor('OPEN')}
                disabled={loading !== '' || isOpen}
                loading={loading === 'OPEN'}
              />
              <ActionButton
                label="Đóng cửa"
                icon={<Lock size={14} strokeWidth={1.5} />}
                variant="success"
                onClick={() => handleDoor('CLOSE')}
                disabled={loading !== '' || !isOpen}
                loading={loading === 'CLOSE'}
              />
            </div>
          </div>

          {/* Last access card */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--space-lg)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}>
              <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                Lượt quẹt thẻ gần nhất
              </span>
            </div>

            {lastUID ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: lastAccess === 'granted' ? 'var(--success-bg)' : 'var(--danger-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: lastAccess === 'granted' ? 'var(--success-text)' : 'var(--danger-text)',
                  flexShrink: 0,
                }}>
                  {lastAccess === 'granted'
                    ? <ShieldCheck size={18} strokeWidth={1.5} />
                    : <ShieldAlert size={18} strokeWidth={1.5} />}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: 'var(--text-heading)',
                    fontWeight: 500,
                  }}>
                    {lastUID}
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 500,
                    borderRadius: 999,
                    padding: '2px 9px',
                    marginTop: 4,
                    background: lastAccess === 'granted' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color:      lastAccess === 'granted' ? 'var(--success-text)' : 'var(--danger-text)',
                  }}>
                    {lastAccess === 'granted' ? '✓ Cho phép' : '✕ Từ chối'}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-hint)', fontSize: 13, margin: 0 }}>
                Chưa có lượt quẹt thẻ nào.
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Card management ── */}
        <div style={{
          flex: 1.4,
          minWidth: 300,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
          padding: 'var(--space-2xl)',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-heading)' }}>
                Danh sách thẻ RFID
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {uidList.length}/10 thẻ đã đăng ký
              </div>
            </div>
            <ActionButton
              label="Học thẻ mới"
              icon={<Nfc size={14} strokeWidth={1.5} />}
              variant="primary"
              onClick={handleLearn}
              disabled={loading === 'learn'}
              loading={loading === 'learn'}
            />
          </div>

          {/* Progress bar */}
          <div style={{
            height: 4,
            borderRadius: 999,
            background: 'var(--border-default)',
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(uidList.length / 10) * 100}%`,
              borderRadius: 999,
              background: uidList.length >= 8
                ? 'var(--danger-text)'
                : 'var(--accent-primary)',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Manual add */}
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-strong)',
            padding: 'var(--space-md)',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Thêm thẻ thủ công
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="VD: 83:15:ce:06"
                value={manualUID}
                onChange={(e) => setManualUID(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                disabled={loading === 'addManual'}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: 'var(--text-heading)',
                  outline: 'none',
                }}
              />
              <ActionButton
                label="Thêm"
                icon={<Plus size={14} strokeWidth={1.5} />}
                variant="default"
                onClick={handleAddManual}
                disabled={loading === 'addManual' || !manualUID.trim()}
                loading={loading === 'addManual'}
              />
            </div>
          </div>

          <Divider />

          {/* Card list */}
          {uidList.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '32px 0',
              color: 'var(--text-hint)',
            }}>
              <CreditCard size={32} strokeWidth={1} />
              <span style={{ fontSize: 13 }}>Chưa có thẻ nào được đăng ký</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uidList.map((uid, i) => (
                <div
                  key={uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {/* Card icon */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-pale)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    flexShrink: 0,
                  }}>
                    <CreditCard size={14} strokeWidth={1.5} />
                  </div>

                  {/* UID info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: 'var(--text-heading)',
                      fontWeight: 500,
                    }}>
                      {uid}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>
                      Thẻ #{i + 1}
                    </div>
                  </div>

                  {/* Delete btn */}
                  <button
                    onClick={() => handleRemove(uid)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-hint)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--danger-bg)';
                      e.currentTarget.style.color = 'var(--danger-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-hint)';
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoorPage;