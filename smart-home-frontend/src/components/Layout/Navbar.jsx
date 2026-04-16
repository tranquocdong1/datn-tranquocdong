import useAuthStore  from '../../store/authStore';
import useDeviceStore from '../../store/deviceStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const { user, logout }  = useAuthStore();
  const { intruderAlert, gas } = useDeviceStore();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{
      height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {(intruderAlert || gas === 1) && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fef2f2', color: '#dc2626',
            padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          }}>
            <AlertTriangle size={14} />
            {intruderAlert ? 'XÂM NHẬP!' : 'PHÁT HIỆN KHÍ GAS!'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          👤 {user?.username || 'Admin'}
        </span>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8, border: 'none',
          background: '#f1f5f9', cursor: 'pointer', fontSize: 13, color: '#475569',
        }}>
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Navbar;