const ToggleButton = ({ label, active, onClick, color = '#3b82f6', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '8px 18px', borderRadius: 8, border: 'none',
      background: active ? color : '#f1f5f9',
      color: active ? '#fff' : '#64748b',
      fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
    }}
  >
    {label}
  </button>
);

export default ToggleButton;