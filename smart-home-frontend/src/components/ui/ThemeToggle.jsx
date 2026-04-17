// src/components/ui/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { dark, toggle } = useTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', minWidth: 28 }}>
        {dark ? 'Tối' : 'Sáng'}
      </span>
      <div
        onClick={toggle}
        style={{
          width: 52, height: 28, borderRadius: 'var(--radius-full)',
          background: dark ? 'var(--accent-primary)' : 'var(--border-strong)',
          border: `1px solid ${dark ? 'var(--accent-primary)' : 'var(--border-default)'}`,
          position: 'relative', cursor: 'pointer',
          transition: 'background 0.3s, border-color 0.3s',
          display: 'flex', alignItems: 'center', padding: 3,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 22, height: 22, borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: dark ? 'translateX(24px)' : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {dark
            ? <Moon size={12} strokeWidth={1.5} color="#EF9F27" />
            : <Sun size={12} strokeWidth={1.5} color="#888780" />
          }
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;