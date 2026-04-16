import { NavLink }   from 'react-router-dom';
import { LayoutDashboard, DoorOpen, Thermometer, Wind, History } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/door',      label: 'Cửa & Thẻ',  icon: DoorOpen },
  { to: '/room',      label: 'Phòng',       icon: Thermometer },
  { to: '/clothes',   label: 'Giàn phơi',   icon: Wind },
  { to: '/logs',      label: 'Lịch sử',     icon: History },
];

const Sidebar = () => (
  <aside style={{
    width: 220, background: '#1e293b', color: '#fff',
    display: 'flex', flexDirection: 'column', padding: '24px 0',
  }}>
    <div style={{ padding: '0 24px 32px', fontSize: 20, fontWeight: 700 }}>
      🏠 Smart Home
    </div>
    {links.map(({ to, label, icon: Icon }) => (
      <NavLink key={to} to={to} style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 24px', textDecoration: 'none',
        color: isActive ? '#38bdf8' : '#94a3b8',
        background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
        borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
        transition: 'all 0.2s',
      })}>
        <Icon size={18} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      </NavLink>
    ))}
  </aside>
);

export default Sidebar;