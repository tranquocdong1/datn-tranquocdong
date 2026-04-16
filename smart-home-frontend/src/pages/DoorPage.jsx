import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  sendDoorCmd,
  learnMode,
  removeUID,
  listUID,
  addUID,
} from "../api/doorApi";
import useDeviceStore from "../store/deviceStore";
import ToggleButton from "../components/ui/ToggleButton";

const DoorPage = () => {
  const { doorStatus, lastAccess, lastUID, uidList } = useDeviceStore();
  const [loading, setLoading] = useState("");
  const [manualUID, setManualUID] = useState("");

  const handleAddManual = async () => {
    const uid = manualUID.trim();
    if (!uid) return toast.error("Vui lòng nhập UID!");
    setLoading("addManual");
    try {
      await addUID(uid);
      toast.success(`Đã thêm thẻ ${uid}`);
      setManualUID("");
    } catch {
      toast.error("Thêm thẻ thất bại!");
    } finally {
      setLoading("");
    }
  };

  // Load danh sách thẻ khi vào trang
  useEffect(() => {
    listUID();
  }, []);

  const handleDoor = async (cmd) => {
    setLoading(cmd);
    try {
      await sendDoorCmd(cmd);
      toast.success(`Đã gửi lệnh ${cmd}`);
    } catch {
      toast.error("Gửi lệnh thất bại!");
    } finally {
      setLoading("");
    }
  };

  const handleLearn = async () => {
    setLoading("learn");
    try {
      await learnMode();
      toast("Đang chờ quẹt thẻ mới... (10 giây)", { icon: "🪪" });
    } catch {
      toast.error("Lỗi!");
    } finally {
      setLoading("");
    }
  };

  const handleRemove = async (uid) => {
    if (!window.confirm(`Xóa thẻ ${uid}?`)) return;
    try {
      await removeUID(uid);
    } catch {
      toast.error("Xóa thẻ thất bại!");
    }
  };

  return (
    <div>
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: 22,
          fontWeight: 700,
          color: "#1e293b",
        }}
      >
        Quản lý cửa & thẻ RFID
      </h2>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {/* Card điều khiển cửa */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            flex: 1,
            minWidth: 280,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Trạng thái cửa</h3>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              marginBottom: 24,
              background: doorStatus === "open" ? "#fffbeb" : "#f0fdf4",
              color: doorStatus === "open" ? "#f59e0b" : "#22c55e",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: doorStatus === "open" ? "#f59e0b" : "#22c55e",
              }}
            />
            {doorStatus === "open" ? "🔓 Đang mở" : "🔒 Đã đóng"}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <ToggleButton
              label="🔓 Mở cửa"
              active={doorStatus === "open"}
              onClick={() => handleDoor("OPEN")}
              color="#f59e0b"
              disabled={loading !== "" || doorStatus === "open"}
            />
            <ToggleButton
              label="🔒 Đóng cửa"
              active={doorStatus === "closed"}
              onClick={() => handleDoor("CLOSE")}
              color="#22c55e"
              disabled={loading !== "" || doorStatus === "closed"}
            />
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
            <h4 style={{ margin: "0 0 6px", fontSize: 14, color: "#64748b" }}>
              Lượt quẹt thẻ gần nhất
            </h4>
            {lastUID && (
              <p
                style={{
                  margin: "0 0 4px",
                  fontFamily: "monospace",
                  fontSize: 15,
                }}
              >
                🪪 {lastUID}
              </p>
            )}
            {lastAccess && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: lastAccess === "granted" ? "#f0fdf4" : "#fef2f2",
                  color: lastAccess === "granted" ? "#22c55e" : "#ef4444",
                }}
              >
                {lastAccess === "granted" ? "✅ Cho phép" : "❌ Từ chối"}
              </span>
            )}
          </div>
        </div>

        {/* Card quản lý thẻ */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            flex: 1,
            minWidth: 280,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Danh sách thẻ RFID</h3>
            <button
              onClick={handleLearn}
              disabled={loading === "learn"}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading === "learn" ? "⏳ Đang chờ..." : "+ Học thẻ mới"}
            </button>
          </div>

          <div
            style={{
              border: "1.5px dashed #cbd5e1",
              borderRadius: 10,
              padding: "14px",
              marginBottom: 16,
              background: "#f8fafc",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 13,
                fontWeight: 600,
                color: "#64748b",
              }}
            >
              Thêm thẻ thủ công
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="VD: 83:15:ce:06"
                value={manualUID}
                onChange={(e) => setManualUID(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                disabled={loading === "addManual"}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontFamily: "monospace",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleAddManual}
                disabled={loading === "addManual" || !manualUID.trim()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#334155",
                  whiteSpace: "nowrap",
                }}
              >
                {loading === "addManual" ? "⏳" : "Thêm"}
              </button>
            </div>
          </div>

          {uidList.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              Chưa có thẻ nào được đăng ký.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {uidList.map((uid, i) => (
                <div
                  key={uid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#f8fafc",
                    borderRadius: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    🪪 Thẻ {i + 1}: {uid}
                  </span>
                  <button
                    onClick={() => handleRemove(uid)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#fef2f2",
                      color: "#ef4444",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          <p style={{ margin: "16px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Tối đa 10 thẻ. Hiện có: {uidList.length}/10
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoorPage;
