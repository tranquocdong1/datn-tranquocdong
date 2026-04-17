const STATUS_MAP = {
  ok:      { bg: 'var(--success-bg)',  text: 'var(--success-text)',  dot: '#3B6D11' },
  warn:    { bg: 'var(--warning-bg)',  text: 'var(--warning-text)', dot: '#BA7517' },
  danger:  { bg: 'var(--danger-bg)',   text: 'var(--danger-text)',  dot: '#A32D2D' },
  neutral: { bg: 'var(--bg-muted)',    text: 'var(--text-muted)',   dot: '#B8B6B0' },
};

const ACCENT_TINT = {
  amber:  { border: 'var(--accent-primary)', iconBg: 'var(--accent-pale)',  iconColor: 'var(--accent-primary)' },
  green:  { border: '#3B6D11',               iconBg: '#EAFCE8',              iconColor: '#3B6D11' },
  blue:   { border: '#378ADD',               iconBg: '#E6F1FB',              iconColor: '#378ADD' },
  red:    { border: '#A32D2D',               iconBg: '#FCEBEB',              iconColor: '#A32D2D' },
  purple: { border: '#534AB7',               iconBg: '#EEEDFE',              iconColor: '#534AB7' },
  gray:   { border: 'var(--border-strong)',  iconBg: 'var(--bg-muted)',      iconColor: 'var(--text-muted)' },
};

const StatusCard = ({
  title,
  value,
  sub,
  icon,
  accent = 'amber',
  status,
  statusLabel,
}) => {
  const a = ACCENT_TINT[accent] ?? ACCENT_TINT.amber;
  const s = status ? STATUS_MAP[status] ?? STATUS_MAP.neutral : null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-default)',
      borderLeft: `3px solid ${a.border}`,
      boxShadow: 'var(--shadow-card)',
      padding: 'var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: 1,
      minWidth: 160,
    }}>
      {/* Top row: icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && (
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            background: a.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: a.iconColor,
          }}>
            {icon}
          </div>
        )}
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          {title}
        </span>
      </div>

      {/* Metric value */}
      <div style={{
        fontSize: 28,
        fontWeight: 300,
        color: 'var(--text-heading)',
        lineHeight: 1.1,
        paddingLeft: icon ? 0 : 0,
      }}>
        {value}
      </div>

      {/* Sub text or status pill */}
      {(sub || s) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {sub && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>
          )}
          {s && statusLabel && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              fontWeight: 500,
              borderRadius: 999,
              padding: '2px 9px',
              background: s.bg,
              color: s.text,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: s.dot, flexShrink: 0,
              }} />
              {statusLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusCard;