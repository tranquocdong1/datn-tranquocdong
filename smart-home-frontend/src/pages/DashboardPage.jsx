import { useEffect, useState, useCallback } from "react";
import { getSummary, getAccessStats, getTempHistory } from "../api/statsApi";
import useDeviceStore from "../store/deviceStore";
import StatusCard from "../components/cards/StatusCard";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Thermometer,
  Droplets,
  DoorOpen,
  DoorClosed,
  Users,
  Flame,
  Wind,
  Lightbulb,
  BedDouble,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CloudRain,
  Sun,
  Shirt,
  SunDim,
} from "lucide-react";

/* ─── Custom Tooltip ─── */
const WarmTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "8px 14px",
        boxShadow: "var(--shadow-elevated)",
        fontSize: 12,
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

/* ─── Section header ─── */
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: "var(--space-lg)" }}>
    <h2
      style={{
        fontSize: 15,
        fontWeight: 500,
        color: "var(--text-heading)",
        margin: 0,
      }}
    >
      {title}
    </h2>
    {sub && (
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
        {sub}
      </p>
    )}
  </div>
);

const DashboardPage = () => {
  const {
    doorStatus,
    clothesStatus,
    rainStatus,
    temperature,
    humidity,
    gas,
    people,
    fanStatus,
    livingLed,
    bedroomLed,
    intruderAlert,
    light,
  } = useDeviceStore();

  const [summary, setSummary] = useState(null);
  const [accessData, setAccessData] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);

  // ── Tách fetchSummary ra useCallback để dùng lại ──
  const fetchSummary = useCallback(() => {
    getSummary()
      .then((r) => setSummary(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch tất cả dữ liệu lần đầu
    fetchSummary();
    getAccessStats(7)
      .then((r) => setAccessData(r.data))
      .catch(console.error);
    getTempHistory(24)
      .then((r) =>
        setTempHistory(
          r.data.map((d) => ({
            time: new Date(d.time).toLocaleTimeString("vi", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            temp: d.temp,
            hum: d.hum,
          })),
        ),
      )
      .catch(console.error);

    // Polling summary mỗi 10 giây — không cần reset trang nữa
    const summaryInterval = setInterval(fetchSummary, 10_000);
    return () => clearInterval(summaryInterval);
  }, [fetchSummary]);

  // Re-fetch summary ngay khi trạng thái cảnh báo thay đổi
  useEffect(() => {
    fetchSummary();
  }, [intruderAlert, gas, fetchSummary]);

  /* ─── Derived helpers ─── */
  const isOpen = doorStatus === "open";
  const isRaining = rainStatus === "raining";
  const isClothesIn = clothesStatus === "in";
  const gasAlert = gas === 1;
  const hasAlert = intruderAlert || gasAlert;
  const isDark = light === "dark";

  const now = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2xl)",
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: "var(--text-heading)",
              margin: 0,
            }}
          >
            Tổng quan hệ thống
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-hint)", marginTop: 3 }}>
            {now}
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 999,
            padding: "5px 14px",
            background: hasAlert ? "var(--danger-bg)" : "var(--success-bg)",
            color: hasAlert ? "var(--danger-text)" : "var(--success-text)",
            animation: hasAlert ? "pulse 1.5s infinite" : "none",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: hasAlert
                ? "var(--danger-text)"
                : "var(--success-text)",
            }}
          />
          {hasAlert
            ? intruderAlert
              ? "Phát hiện xâm nhập!"
              : "Phát hiện khí gas!"
            : "Hoạt động bình thường"}
        </span>
      </div>

      {/* ── Alert banner ── */}
      {hasAlert && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--danger-bg)",
            border: "1px solid #F09595",
            borderRadius: "var(--radius-md)",
            padding: "14px 20px",
            color: "var(--danger-text)",
            fontWeight: 500,
            fontSize: 13,
            animation: "pulse 1.5s infinite",
          }}
        >
          <AlertTriangle size={18} strokeWidth={1.5} />
          {intruderAlert
            ? "CẢNH BÁO: Phát hiện xâm nhập trái phép!"
            : "CẢNH BÁO: Phát hiện khí gas — đang bật quạt thông gió tự động!"}
        </div>
      )}

      {/* ── Sensor row ── */}
      <section>
        <SectionHeader
          title="Cảm biến môi trường"
          sub="Cập nhật theo thời gian thực"
        />
        <div
          style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}
        >
          <StatusCard
            title="Nhiệt độ"
            value={`${temperature}°C`}
            sub={`Độ ẩm ${humidity}%`}
            icon={<Thermometer size={16} strokeWidth={1.5} />}
            accent={temperature >= 35 ? "red" : "amber"}
            status={temperature >= 35 ? "danger" : "ok"}
            statusLabel={temperature >= 35 ? "Quá nóng" : "Bình thường"}
          />
          <StatusCard
            title="Khí Gas"
            value={gasAlert ? "Cảnh báo!" : "Bình thường"}
            sub="Cảm biến MQ-2"
            icon={<Flame size={16} strokeWidth={1.5} />}
            accent={gasAlert ? "red" : "green"}
            status={gasAlert ? "danger" : "ok"}
            statusLabel={gasAlert ? "Nguy hiểm" : "An toàn"}
          />
          <StatusCard
            title="Số người"
            value={people}
            sub="người trong nhà"
            icon={<Users size={16} strokeWidth={1.5} />}
            accent="blue"
            status="neutral"
            statusLabel="PIR"
          />
          <StatusCard
            title="Thời tiết"
            value={isRaining ? "Mưa" : "Nắng"}
            sub={isRaining ? "Đã thu giàn phơi" : "Trời quang"}
            icon={
              isRaining ? (
                <CloudRain size={16} strokeWidth={1.5} />
              ) : (
                <Sun size={16} strokeWidth={1.5} />
              )
            }
            accent={isRaining ? "blue" : "amber"}
            status={isRaining ? "warn" : "ok"}
            statusLabel={isRaining ? "Đang mưa" : "Trời nắng"}
          />
          <StatusCard
            title="Ánh sáng"
            value={isDark ? "Tối" : "Sáng"}
            sub={isDark ? "Đèn tự động bật" : "Đủ ánh sáng"}
            icon={
              isDark ? (
                <SunDim size={16} strokeWidth={1.5} />
              ) : (
                <Sun size={16} strokeWidth={1.5} />
              )
            }
            accent={isDark ? "purple" : "amber"}
            status={isDark ? "warn" : "ok"}
            statusLabel={isDark ? "Cần đèn" : "Tự nhiên"}
          />
        </div>
      </section>

      {/* ── Device status row ── */}
      <section>
        <SectionHeader title="Trạng thái thiết bị" />
        <div
          style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}
        >
          <StatusCard
            title="Cửa chính"
            value={isOpen ? "Đang mở" : "Đã đóng"}
            sub="Khóa điện từ"
            icon={
              isOpen ? (
                <DoorOpen size={16} strokeWidth={1.5} />
              ) : (
                <DoorClosed size={16} strokeWidth={1.5} />
              )
            }
            accent={isOpen ? "amber" : "green"}
            status={isOpen ? "warn" : "ok"}
            statusLabel={isOpen ? "Đang mở" : "Đã khóa"}
          />
          <StatusCard
            title="Giàn phơi"
            value={isClothesIn ? "Đã thu vào" : "Đang phơi"}
            sub="Động cơ servo"
            icon={<Shirt size={16} strokeWidth={1.5} />}
            accent={isClothesIn ? "purple" : "green"}
            status={isClothesIn ? "warn" : "ok"}
            statusLabel={isClothesIn ? "Đã vào" : "Ngoài trời"}
          />
          <StatusCard
            title="Quạt thông gió"
            value={fanStatus === "1" ? "Đang bật" : "Tắt"}
            sub="Relay 1"
            icon={<Wind size={16} strokeWidth={1.5} />}
            accent={fanStatus === "1" ? "blue" : "gray"}
            status={fanStatus === "1" ? "ok" : "neutral"}
            statusLabel={fanStatus === "1" ? "Hoạt động" : "Nghỉ"}
          />
          <StatusCard
            title="Đèn phòng khách"
            value={livingLed === "1" ? "Đang bật" : "Tắt"}
            sub="LED strip"
            icon={<Lightbulb size={16} strokeWidth={1.5} />}
            accent={livingLed === "1" ? "amber" : "gray"}
            status={livingLed === "1" ? "ok" : "neutral"}
            statusLabel={livingLed === "1" ? "Bật" : "Tắt"}
          />
          <StatusCard
            title="Đèn phòng ngủ"
            value={bedroomLed === "1" ? "Đang bật" : "Tắt"}
            sub="LED strip"
            icon={<BedDouble size={16} strokeWidth={1.5} />}
            accent={bedroomLed === "1" ? "amber" : "gray"}
            status={bedroomLed === "1" ? "ok" : "neutral"}
            statusLabel={bedroomLed === "1" ? "Bật" : "Tắt"}
          />
        </div>
      </section>

      {/* ── Summary stats ── */}
      {summary && (
        <section>
          <SectionHeader title="Thống kê hôm nay" />
          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              flexWrap: "wrap",
            }}
          >
            <StatusCard
              title="Lượt vào"
              value={summary.granted}
              sub="Được cấp phép"
              icon={<CheckCircle2 size={16} strokeWidth={1.5} />}
              accent="green"
              status="ok"
              statusLabel="Hôm nay"
            />
            <StatusCard
              title="Lượt từ chối"
              value={summary.denied}
              sub="Không xác thực"
              icon={<XCircle size={16} strokeWidth={1.5} />}
              accent="red"
              status={summary.denied > 0 ? "danger" : "ok"}
              statusLabel={summary.denied > 0 ? "Cần chú ý" : "Sạch"}
            />
            <StatusCard
              title="Cảnh báo gas"
              value={summary.gasAlerts}
              sub="Lần kích hoạt"
              icon={<Flame size={16} strokeWidth={1.5} />}
              accent={summary.gasAlerts > 0 ? "red" : "gray"}
              status={summary.gasAlerts > 0 ? "danger" : "neutral"}
              statusLabel={summary.gasAlerts > 0 ? "Có sự cố" : "Bình thường"}
            />
            <StatusCard
              title="Xâm nhập"
              value={summary.intruders}
              sub="Phát hiện bất thường"
              icon={<ShieldAlert size={16} strokeWidth={1.5} />}
              accent={summary.intruders > 0 ? "red" : "gray"}
              status={summary.intruders > 0 ? "danger" : "neutral"}
              statusLabel={summary.intruders > 0 ? "Cảnh báo" : "An toàn"}
            />
          </div>
        </section>
      )}

      {/* ── Charts ── */}
      <section>
        <SectionHeader
          title="Biểu đồ theo dõi"
          sub="Dữ liệu cảm biến và lịch sử truy cập"
        />
        <div
          style={{ display: "flex", gap: "var(--space-xl)", flexWrap: "wrap" }}
        >
          {/* Temp / humidity area chart */}
          <div
            style={{
              flex: 1,
              minWidth: 300,
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-card)",
              padding: "var(--space-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "var(--space-lg)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-heading)",
                  }}
                >
                  Nhiệt độ &amp; Độ ẩm
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  24 giờ qua
                </div>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                {[
                  { color: "#EF9F27", label: "Nhiệt độ" },
                  { color: "#85B7EB", label: "Độ ẩm" },
                ].map(({ color, label }) => (
                  <span
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 2,
                        background: color,
                        borderRadius: 2,
                        display: "inline-block",
                      }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {tempHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={tempHistory}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#EF9F27"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#EF9F27" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#85B7EB"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#85B7EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "var(--text-hint)" }}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-hint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<WarmTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    name="Nhiệt độ °C"
                    stroke="#EF9F27"
                    strokeWidth={2}
                    fill="url(#tempGrad)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#EF9F27",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hum"
                    name="Độ ẩm %"
                    stroke="#85B7EB"
                    strokeWidth={2}
                    fill="url(#humGrad)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#85B7EB",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-hint)",
                  fontSize: 13,
                }}
              >
                Chưa có dữ liệu nhiệt độ
              </div>
            )}
          </div>

          {/* Access bar chart */}
          <div
            style={{
              flex: 1,
              minWidth: 300,
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-card)",
              padding: "var(--space-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "var(--space-lg)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-heading)",
                  }}
                >
                  Lượt ra vào
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  7 ngày qua
                </div>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                {[
                  { color: "#3B6D11", label: "Cho phép" },
                  { color: "#A32D2D", label: "Từ chối" },
                ].map(({ color, label }) => (
                  <span
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: color,
                        display: "inline-block",
                      }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {accessData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={accessData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--text-hint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-hint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<WarmTooltip />} />
                  <Bar
                    dataKey="granted"
                    name="Cho phép"
                    fill="rgba(59,109,17,0.75)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="denied"
                    name="Từ chối"
                    fill="rgba(163,45,45,0.7)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-hint)",
                  fontSize: 13,
                }}
              >
                Chưa có dữ liệu truy cập
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
