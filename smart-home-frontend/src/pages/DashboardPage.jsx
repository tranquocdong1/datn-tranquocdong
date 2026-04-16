import { useEffect, useState } from 'react';
import { getSummary, getAccessStats, getTempHistory } from '../api/statsApi';
import useDeviceStore from '../store/deviceStore';
import StatusCard     from '../components/cards/StatusCard';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';

const DashboardPage = () => {
  const {
    doorStatus, clothesStatus, rainStatus,
    temperature, humidity, gas, people,
    fanStatus, livingLed, bedroomLed, intruderAlert,
  } = useDeviceStore();

  const [summary,     setSummary]     = useState(null);
  const [accessData,  setAccessData]  = useState([]);
  const [tempHistory, setTempHistory] = useState([]);

  useEffect(() => {
    getSummary()
      .then((r) => setSummary(r.data))
      .catch(console.error);
    getAccessStats(7)
      .then((r) => setAccessData(r.data))
      .catch(console.error);
    getTempHistory(24)
      .then((r) => setTempHistory(
        r.data.map((d) => ({
          time: new Date(d.time).toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }),
          temp: d.temp,
          hum:  d.hum,
        }))
      ))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
        Tổng quan hệ thống
      </h2>

      {/* Cảnh báo */}
      {(intruderAlert || gas === 1) && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '14px 20px', marginBottom: 20, color: '#dc2626',
          fontWeight: 600, fontSize: 15,
        }}>
          🚨 {intruderAlert ? 'PHÁT HIỆN XÂM NHẬP!' : 'PHÁT HIỆN KHÍ GAS! Đang bật quạt thông gió...'}
        </div>
      )}

      {/* Row 1: Trạng thái thiết bị */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatusCard
          title="Cửa chính"
          value={doorStatus === 'open' ? 'Đang mở' : 'Đã đóng'}
          icon="🚪"
          color={doorStatus === 'open' ? '#f59e0b' : '#22c55e'}
          bg={doorStatus === 'open' ? '#fffbeb' : '#f0fdf4'}
        />
        <StatusCard
          title="Thời tiết"
          value={rainStatus === 'raining' ? 'Đang mưa' : 'Trời nắng'}
          icon={rainStatus === 'raining' ? '🌧️' : '☀️'}
          color={rainStatus === 'raining' ? '#3b82f6' : '#f59e0b'}
          bg={rainStatus === 'raining' ? '#eff6ff' : '#fffbeb'}
        />
        <StatusCard
          title="Giàn phơi"
          value={clothesStatus === 'in' ? 'Đã thu vào' : 'Đang phơi'}
          icon="👕"
          color={clothesStatus === 'in' ? '#8b5cf6' : '#22c55e'}
          bg={clothesStatus === 'in' ? '#f5f3ff' : '#f0fdf4'}
        />
        <StatusCard
          title="Số người trong phòng"
          value={people}
          icon="👥"
          color="#0ea5e9"
          bg="#f0f9ff"
          sub="người"
        />
      </div>

      {/* Row 2: Cảm biến + Thiết bị */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatusCard
          title="Nhiệt độ"
          value={`${temperature}°C`}
          icon="🌡️"
          color={temperature >= 35 ? '#ef4444' : '#f59e0b'}
          bg={temperature >= 35 ? '#fef2f2' : '#fffbeb'}
          sub={`Độ ẩm: ${humidity}%`}
        />
        <StatusCard
          title="Khí gas"
          value={gas === 1 ? 'Phát hiện!' : 'Bình thường'}
          icon={gas === 1 ? '⚠️' : '✅'}
          color={gas === 1 ? '#ef4444' : '#22c55e'}
          bg={gas === 1 ? '#fef2f2' : '#f0fdf4'}
        />
        <StatusCard
          title="Quạt"
          value={fanStatus === '1' ? 'Đang bật' : 'Tắt'}
          icon="🌀"
          color={fanStatus === '1' ? '#3b82f6' : '#94a3b8'}
          bg={fanStatus === '1' ? '#eff6ff' : '#f8fafc'}
        />
        <StatusCard
          title="Đèn phòng khách"
          value={livingLed === '1' ? 'Đang bật' : 'Tắt'}
          icon="💡"
          color={livingLed === '1' ? '#f59e0b' : '#94a3b8'}
          bg={livingLed === '1' ? '#fffbeb' : '#f8fafc'}
        />
      </div>

      {/* Row 3: Stats hôm nay */}
      {summary && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatusCard title="Lượt vào hôm nay"   value={summary.granted}   icon="✅" color="#22c55e" bg="#f0fdf4" />
          <StatusCard title="Lượt từ chối"        value={summary.denied}    icon="❌" color="#ef4444" bg="#fef2f2" />
          <StatusCard title="Cảnh báo gas"        value={summary.gasAlerts} icon="⚠️" color="#f59e0b" bg="#fffbeb" />
          <StatusCard title="Cảnh báo xâm nhập"  value={summary.intruders} icon="🚨" color="#8b5cf6" bg="#f5f3ff" />
        </div>
      )}

      {/* Row 4: Charts */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Chart nhiệt độ */}
        <div style={{
          flex: 1, minWidth: 320, background: '#fff', borderRadius: 16,
          padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
            Nhiệt độ & Độ ẩm (24h)
          </h3>
          {tempHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tempHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" name="Nhiệt độ (°C)" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="hum"  stroke="#3b82f6" name="Độ ẩm (%)"     dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 60 }}>
              Chưa có dữ liệu nhiệt độ
            </p>
          )}
        </div>

        {/* Chart access */}
        <div style={{
          flex: 1, minWidth: 320, background: '#fff', borderRadius: 16,
          padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
            Lượt ra vào (7 ngày)
          </h3>
          {accessData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={accessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="granted" fill="#22c55e" name="Cho phép"  radius={[4,4,0,0]} />
                <Bar dataKey="denied"  fill="#ef4444" name="Từ chối"   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 60 }}>
              Chưa có dữ liệu access
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;