function Dashboard() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Smart Home Dashboard</h1>
      <p style={styles.subtitle}>IoT Smart Home Monitoring & Control System</p>

      <div style={styles.grid}>
        {/* System Status */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>System Status</h2>
          <p>Sensor and device status will appear here.</p>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    minHeight: "220px",
  },
  cardTitle: {
    fontSize: "20px",
    marginBottom: "16px",
    color: "#111827",
  },
};

export default Dashboard;