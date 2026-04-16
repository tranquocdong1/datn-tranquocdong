import { Outlet }  from 'react-router-dom';
import Sidebar     from './Sidebar';
import Navbar      from './Navbar';
import useSocket   from '../../hooks/useSocket';
import { useEffect } from 'react';
import { getOverview } from '../../api/statsApi';
import useDeviceStore  from '../../store/deviceStore';

const Layout = () => {
  useSocket(); // kết nối socket toàn app
  const initFromAPI = useDeviceStore((s) => s.initFromAPI);

  // Load trạng thái ban đầu từ DB khi vào app
  useEffect(() => {
    getOverview()
      .then((res) => initFromAPI(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;