import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

/**
 * Props:
 *  - onExport(type: 'csv' | 'pdf') — callback gọi khi user chọn
 *  - disabled  — khoá nút khi đang export/loading
 *  - exporting — hiển thị spinner khi đang xử lý
 */
const ExportDropdown = ({ onExport, disabled, exporting }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (type) => {
    setOpen(false);
    onExport(type);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        title="Xuất báo cáo"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          color: exporting ? 'var(--text-hint)' : 'var(--text-body)',
          fontSize: 12,
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >
        {exporting ? (
          <span style={{
            width: 13, height: 13,
            borderRadius: '50%',
            border: '2px solid var(--accent-light)',
            borderTopColor: 'var(--accent-primary)',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }} />
        ) : (
          <Download size={13} strokeWidth={1.8} />
        )}
        {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
      </button>

      {/* ── Dropdown menu ── */}
      {open && (
        <>
          {/* Overlay – click ngoài để đóng */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9 }}
            onClick={() => setOpen(false)}
          />

          <div style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 10,
            minWidth: 170,
            overflow: 'hidden',
          }}>
            {MENU_ITEMS.map(({ type, icon: Icon, label, hint }, idx) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: idx < MENU_ITEMS.length - 1
                    ? '1px solid var(--border-default)'
                    : 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={15} strokeWidth={1.6} style={{ marginTop: 1, flexShrink: 0, color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-body)', fontWeight: 500 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                    {hint}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MENU_ITEMS = [
  {
    type: 'csv',
    icon: FileSpreadsheet,
    label: 'Xuất CSV',
    hint: 'Mở được bằng Excel',
  },
  {
    type: 'pdf',
    icon: FileText,
    label: 'Xuất PDF',
    hint: 'In hoặc chia sẻ',
  },
];

export default ExportDropdown;