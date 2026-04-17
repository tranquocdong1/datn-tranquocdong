import { useNavigate }  from 'react-router-dom';
import { LogOut, AlertTriangle, Bell } from 'lucide-react';
import useAuthStore     from '../../store/authStore';
import useDeviceStore   from '../../store/deviceStore';

const Navbar = () => {
  const { user, logout }       = useAuthStore();
  const { intruderAlert, gas } = useDeviceStore();
  const navigate               = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const hasAlert = intruderAlert || gas === 1;

  return (
    <header style={{
      height: 60,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-xl)',
      flexShrink: 0,
    }}>

      {/* Left — alert or empty */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {hasAlert ? (
          <span style={{
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
          }}>
            <AlertTriangle size={13} strokeWidth={2} />
            {intruderAlert ? 'XÂM NHẬP!' : 'PHÁT HIỆN KHÍ GAS!'}
          </span>
        ) : (
          <span style={{
            fontSize: 13,
            color: 'var(--text-hint)',
          }}>
            Hệ thống hoạt động bình thường
          </span>
        )}
      </div>

      {/* Right — bell + user + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Bell icon */}
        <button className="icon-btn" style={{ position: 'relative' }}>
          <Bell size={17} strokeWidth={1.5} />
          {hasAlert && (
            <span style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--danger-text)',
              border: '1.5px solid var(--bg-card)',
            }} />
          )}
        </button>

        {/* Divider */}
        <div style={{
          width: 1,
          height: 20,
          background: 'var(--border-default)',
          margin: '0 4px',
        }} />

        {/* Avatar + username */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            className="avatar avatar-sm"
            style={{ background: 'var(--accent-primary)' }}
          >
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-heading)',
          }}>
            {user?.username || 'Admin'}
          </span>
        </div>

        {/* Logout */}
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