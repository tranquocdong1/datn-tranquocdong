import { useState } from "react";
import { toast } from "react-hot-toast";
import { fanCmd, livingLedCmd, bedroomLedCmd, alertCmd } from "../api/roomApi";
import useDeviceStore from "../store/deviceStore";
import {
  Thermometer,
  Droplets,
  Users,
  Flame,
  Wind,
  Lightbulb,
  BedDouble,
  Bell,
  BellOff,
  Sun,
  Moon,
  Power,
  RotateCcw,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

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

/* ─── Sensor metric card ─── */
const SensorCard = ({
  title,
  value,
  sub,
  icon,
  accentColor,
  bgColor,
  borderColor,
}) => (
  <div
    style={{
      flex: 1,
      minWidth: 140,
      background: "var(--bg-card)",
      borderRadius: "var(--radius-lg)",
      border: `1px solid ${borderColor || "var(--border-default)"}`,
      boxShadow: "var(--shadow-card)",
      padding: "var(--space-lg)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {title}
      </span>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "var(--radius-sm)",
          background: bgColor || "var(--accent-pale)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accentColor || "var(--accent-primary)",
        }}
      >
        {icon}
      </div>
    </div>
    <div
      style={{
        fontSize: 28,
        fontWeight: 300,
        color: "var(--text-heading)",
        lineHeight: 1,
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
    )}
  </div>
);

/* ─── Device control card ─── */
const DeviceCard = ({
  title,
  sub,
  icon,
  status,
  onCmd,
  accentColor,
  loading,
  hideAuto,
}) => {
  const isOn = status === "1";

  // Lọc bỏ nút AUTO nếu hideAuto là true
  const cmdButtons = [
    { cmd: "ON", label: "Bật", icon: <Power size={12} strokeWidth={1.5} /> },
    { cmd: "OFF", label: "Tắt", icon: <BellOff size={12} strokeWidth={1.5} /> },
    {
      cmd: "AUTO",
      label: "Tự động",
      icon: <RotateCcw size={12} strokeWidth={1.5} />,
    },
  ].filter((btn) => !(hideAuto && btn.cmd === "AUTO"));

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-card)",
        padding: "var(--space-lg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "var(--space-md)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: isOn ? "var(--accent-pale)" : "var(--bg-muted)",
            border: `1px solid ${isOn ? "var(--accent-pale-border)" : "var(--border-default)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isOn ? "var(--accent-primary)" : "var(--text-hint)",
            transition: "all 0.2s",
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-heading)",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            fontWeight: 500,
            borderRadius: 999,
            padding: "3px 10px",
            background: isOn ? "var(--accent-pale)" : "var(--bg-muted)",
            color: isOn ? "var(--warning-text)" : "var(--text-hint)",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: isOn ? "var(--accent-primary)" : "var(--text-hint)",
            }}
          />
          {isOn ? "Đang bật" : "Tắt"}
        </span>
      </div>

      {/* Command buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        {cmdButtons.map(({ cmd, label, icon: btnIcon }) => (
          <button
            key={cmd}
            onClick={() => onCmd(cmd)}
            disabled={loading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "7px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-default)",
              background: "var(--bg-muted)",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-body)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "inherit",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "var(--accent-pale)";
                e.currentTarget.style.color = "var(--warning-text)";
                e.currentTarget.style.borderColor = "var(--accent-pale-border)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-muted)";
              e.currentTarget.style.color = "var(--text-body)";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
          >
            {btnIcon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

const RoomPage = () => {
  const {
    temperature,
    humidity,
    gas,
    people,
    light,
    buzzer,
    fanStatus,
    livingLed,
    bedroomLed,
  } = useDeviceStore();

  const [alertLoading, setAlertLoading] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState("");

  const handleAlert = async (cmd) => {
    setAlertLoading(true);
    try {
      await alertCmd(cmd);
      toast(cmd === "INTRUDER" ? "Đã kích hoạt còi cảnh báo!" : "Đã tắt còi", {
        icon: cmd === "INTRUDER" ? "🚨" : "🔕",
      });
    } catch {
      toast.error("Lỗi khi gửi lệnh!");
    } finally {
      setAlertLoading(false);
    }
  };

  const makeDeviceHandler = (fn, label, key) => async (cmd) => {
    setDeviceLoading(key + cmd);
    try {
      await fn(cmd);
      toast.success(`${label}: ${cmd}`);
    } catch {
      toast.error("Lỗi!");
    } finally {
      setDeviceLoading("");
    }
  };

  const gasAlert = gas === 1;
  const isDark = light === "dark";
  const buzzerOn = buzzer === 1;

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
            Quản lý phòng
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
            background: gasAlert ? "var(--danger-bg)" : "var(--success-bg)",
            color: gasAlert ? "var(--danger-text)" : "var(--success-text)",
            animation: gasAlert ? "pulse 1.5s infinite" : "none",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: gasAlert
                ? "var(--danger-text)"
                : "var(--success-text)",
            }}
          />
          {gasAlert ? "Phát hiện khí gas!" : "Môi trường bình thường"}
        </span>
      </div>

      {/* ── Gas alert banner ── */}
      {gasAlert && (
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
          CẢNH BÁO: Phát hiện khí gas — đang bật quạt thông gió tự động!
        </div>
      )}

      {/* ── Sensor cards ── */}
      <section>
        <SectionHeader
          title="Cảm biến môi trường"
          sub="Cập nhật theo thời gian thực"
        />
        <div
          style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}
        >
          <SensorCard
            title="Nhiệt độ"
            value={`${temperature}°C`}
            sub={`Độ ẩm ${humidity}%`}
            icon={<Thermometer size={14} strokeWidth={1.5} />}
            accentColor={
              temperature >= 35 ? "var(--danger-text)" : "var(--accent-primary)"
            }
            bgColor={
              temperature >= 35 ? "var(--danger-bg)" : "var(--accent-pale)"
            }
            borderColor={
              temperature >= 35 ? "#F09595" : "var(--border-default)"
            }
          />
          <SensorCard
            title="Số người"
            value={people}
            sub="người trong nhà"
            icon={<Users size={14} strokeWidth={1.5} />}
            accentColor="#185FA5"
            bgColor="#E6F1FB"
          />
          <SensorCard
            title="Ánh sáng"
            value={isDark ? "Tối" : "Sáng"}
            sub={isDark ? "Ánh sáng yếu" : "Đủ ánh sáng"}
            icon={
              isDark ? (
                <Moon size={14} strokeWidth={1.5} />
              ) : (
                <Sun size={14} strokeWidth={1.5} />
              )
            }
            accentColor={isDark ? "#534AB7" : "var(--accent-primary)"}
            bgColor={isDark ? "#EEEDFE" : "var(--accent-pale)"}
          />
          <SensorCard
            title="Khí Gas"
            value={gasAlert ? "Cảnh báo!" : "Bình thường"}
            sub="Cảm biến MQ-2"
            icon={<Flame size={14} strokeWidth={1.5} />}
            accentColor={
              gasAlert ? "var(--danger-text)" : "var(--success-text)"
            }
            bgColor={gasAlert ? "var(--danger-bg)" : "var(--success-bg)"}
            borderColor={gasAlert ? "#F09595" : "var(--border-default)"}
          />
        </div>
      </section>

      {/* ── Main two-column section ── */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-xl)",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* ── LEFT: Device controls ── */}
        <div
          style={{
            flex: 1.6,
            minWidth: 300,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <SectionHeader
            title="Điều khiển thiết bị"
            sub="Bật / Tắt / Tự động"
          />

          <DeviceCard
            title="Đèn phòng khách"
            sub="LED strip · Relay 2"
            icon={<Lightbulb size={16} strokeWidth={1.5} />}
            status={livingLed}
            loading={deviceLoading.startsWith("living")}
            onCmd={makeDeviceHandler(livingLedCmd, "Đèn phòng khách", "living")}
          />
          <DeviceCard
            title="Đèn phòng ngủ"
            sub="LED strip · Relay 3"
            icon={<BedDouble size={16} strokeWidth={1.5} />}
            status={bedroomLed}
            loading={deviceLoading.startsWith("bedroom")}
            onCmd={makeDeviceHandler(bedroomLedCmd, "Đèn phòng ngủ", "bedroom")}
            hideAuto={true} // Thêm dòng này để vô hiệu hóa nút Tự động
          />
          <DeviceCard
            title="Quạt thông gió"
            sub="DC motor · Relay 1"
            icon={<Wind size={16} strokeWidth={1.5} />}
            status={fanStatus}
            loading={deviceLoading.startsWith("fan")}
            onCmd={makeDeviceHandler(fanCmd, "Quạt", "fan")}
          />
        </div>

        {/* ── RIGHT: Buzzer / alert ── */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <SectionHeader title="Còi cảnh báo" sub="Kích hoạt thủ công" />

          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              border: `1px solid ${buzzerOn ? "#F09595" : "var(--border-default)"}`,
              boxShadow: "var(--shadow-card)",
              padding: "var(--space-2xl)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-lg)",
              textAlign: "center",
              animation: buzzerOn ? "pulse 1.5s infinite" : "none",
            }}
          >
            {/* Bell circle */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: buzzerOn ? "var(--danger-bg)" : "var(--bg-muted)",
                border: `2px solid ${buzzerOn ? "#F09595" : "var(--border-strong)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: buzzerOn ? "var(--danger-text)" : "var(--text-hint)",
                transition: "all 0.3s",
              }}
            >
              {buzzerOn ? (
                <Bell size={28} strokeWidth={1.2} />
              ) : (
                <BellOff size={28} strokeWidth={1.2} />
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 300,
                  color: "var(--text-heading)",
                }}
              >
                {buzzerOn ? "Đang kêu!" : "Đang tắt"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                Buzzer · Module cảnh báo
              </div>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 999,
                padding: "4px 14px",
                background: buzzerOn ? "var(--danger-bg)" : "var(--success-bg)",
                color: buzzerOn ? "var(--danger-text)" : "var(--success-text)",
              }}
            >
              {buzzerOn ? (
                <AlertTriangle size={11} strokeWidth={1.5} />
              ) : (
                <CheckCircle2 size={11} strokeWidth={1.5} />
              )}
              {buzzerOn ? "Cảnh báo đang phát" : "Yên tĩnh"}
            </span>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
              }}
            >
              <button
                onClick={() => handleAlert("INTRUDER")}
                disabled={alertLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #F09595",
                  background: "var(--danger-bg)",
                  color: "var(--danger-text)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: alertLoading ? "not-allowed" : "pointer",
                  opacity: alertLoading ? 0.6 : 1,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <Zap size={14} strokeWidth={1.5} />
                {alertLoading ? "Đang xử lý..." : "Kích hoạt cảnh báo"}
              </button>
              <button
                onClick={() => handleAlert("OFF")}
                disabled={alertLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-muted)",
                  color: "var(--text-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: alertLoading ? "not-allowed" : "pointer",
                  opacity: alertLoading ? 0.6 : 1,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <BellOff size={14} strokeWidth={1.5} />
                Tắt còi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
