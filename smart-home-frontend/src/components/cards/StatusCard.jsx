const StatusCard = ({ title, value, sub, icon, color = '#3b82f6', bg = '#eff6ff' }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16, flex: 1, minWidth: 180,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 24, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{title}</p>
      <p style={{ margin: '4px 0 2px', fontSize: 22, fontWeight: 700, color }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
    </div>
  </div>
);

export default StatusCard;