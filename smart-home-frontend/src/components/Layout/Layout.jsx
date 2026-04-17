import { Outlet }      from 'react-router-dom';
import Sidebar         from './Sidebar';
import Navbar          from './Navbar';
import useSocket       from '../../hooks/useSocket';
import { useEffect }   from 'react';
import { getOverview } from '../../api/statsApi';
import useDeviceStore  from '../../store/deviceStore';

const Layout = () => {
  useSocket();
  const initFromAPI = useDeviceStore((s) => s.initFromAPI);

  useEffect(() => {
    getOverview()
      .then((res) => initFromAPI(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-base)',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar />
        <main style={{
          flex: 1,
          padding: 'var(--space-xl)',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;