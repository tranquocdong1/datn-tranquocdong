import { useState }   from 'react';
import { useNavigate } from 'react-router-dom';
import { login }      from '../api/authApi';
import useAuthStore   from '../store/authStore';
import { toast }      from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      setToken(res.data.token);
      setUser({ username: res.data.username, role: res.data.role });
      navigate('/dashboard');
    } catch {
      toast.error('Sai tên đăng nhập hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f4f6fb',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 40,
        width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 24 }}>🏠 Smart Home</h1>
        <p style={{ margin: '0 0 32px', color: '#64748b', fontSize: 14 }}>
          Đăng nhập để quản lý hệ thống
        </p>
        <form onSubmit={handleSubmit}>
          {['username', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500,
                color: '#374151', marginBottom: 6 }}>
                {field === 'username' ? 'Tên đăng nhập' : 'Mật khẩu'}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 8, border: 'none',
            background: loading ? '#94a3b8' : '#3b82f6', color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8,
          }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;