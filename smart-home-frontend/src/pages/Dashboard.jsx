import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCurrentStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/status/current");

      if (response.data.success) {
        setSystemStatus(response.data.data);
      } else {
        setError("Backend returned unsuccessful response");
      }
    } catch (err) {
      console.error("Fetch current status error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch current status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Smart Home Dashboard</h1>
      <p style={styles.subtitle}>IoT Smart Home Monitoring & Control System</p>

      <div style={styles.grid}>
        {/* System Status */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>System Status</h2>
            <button style={styles.refreshBtn} onClick={fetchCurrentStatus}>
              Refresh
            </button>
          </div>

          {loading && <p>Loading current status...</p>}

          {error && <p style={styles.errorText}>Error: {error}</p>}

          {!loading && !error && systemStatus && (
            <div>
              <p style={styles.successText}>Connected to backend successfully ✅</p>

              <div style={styles.infoBox}>
                <pre style={styles.pre}>
                  {JSON.stringify(systemStatus, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {!loading && !error && !systemStatus && (
            <p>No system status data found.</p>
          )}
        </div>

        {/* Device Control */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Device Control</h2>
          <p>Buttons for LED, Fan, Door, Clothes will appear here.</p>
        </div>

        {/* Logs & Alerts */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Logs & Alerts</h2>
          <p>Sensor logs, control logs, alerts will appear here.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: "32px",
    marginBottom: "8px",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: "16px",
    marginBottom: "24px",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    minHeight: "250px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "20px",
    color: "#111827",
  },
  refreshBtn: {
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
  },
  infoBox: {
    marginTop: "12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    padding: "12px",
    maxHeight: "350px",
    overflow: "auto",
  },
  pre: {
    fontSize: "13px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  successText: {
    color: "#16a34a",
    fontWeight: "bold",
    marginBottom: "10px",
  },
};

export default Dashboard;