import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, DoorOpen, Thermometer, Wind, History,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/door',      label: 'Cửa & Thẻ', icon: DoorOpen        },
  { to: '/room',      label: 'Phòng',      icon: Thermometer     },
  { to: '/clothes',   label: 'Giàn phơi',  icon: Wind            },
  { to: '/logs',      label: 'Lịch sử',    icon: History         },
];

const Sidebar = () => (
  <aside style={{
    width: 220,
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-default)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    flexShrink: 0,
  }}>

    {/* Logo */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 20px 28px',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-md)',
        background: 'var(--accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {/* House icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      </div>
      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-heading)',
          lineHeight: 1.2,
        }}>Smart Home</div>
        <div style={{
          fontSize: 10,
          color: 'var(--text-hint)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>Control Panel</div>
      </div>
    </div>

    {/* Nav label */}
    <div style={{
      fontSize: 10,
      fontWeight: 500,
      color: 'var(--text-hint)',
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      padding: '0 20px 10px',
    }}>
      Menu
    </div>

    {/* Nav links */}
    <nav style={{ flex: 1 }}>
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            margin: '2px 12px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
            background: isActive ? 'var(--accent-pale)' : 'transparent',
            transition: 'all 0.15s',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
              />
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
              }}>
                {label}
              </span>
              {isActive && (
                <div style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  marginLeft: 'auto',
                  flexShrink: 0,
                }} />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Bottom divider */}
    <div style={{
      height: 1,
      background: 'var(--border-default)',
      margin: '12px 20px',
    }} />

    {/* Version pill */}
    <div style={{ padding: '0 20px' }}>
      <span className="pill pill-amber" style={{ fontSize: 10 }}>
        v1.0 · Live
      </span>
    </div>
  </aside>
);

export default Sidebar;