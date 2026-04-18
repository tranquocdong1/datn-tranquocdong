import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DoorPage from "./pages/DoorPage";
import RoomPage from "./pages/RoomPage";
import ClothesPage from "./pages/ClothesPage";
import SchedulePage from './pages/SchedulePage';
import LogsPage from "./pages/LogsPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#1A1A1A",
            border: "1px solid #EEECE8",
            borderRadius: "12px",
            fontSize: "13px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="door" element={<DoorPage />} />
          <Route path="room" element={<RoomPage />} />
          <Route path="clothes" element={<ClothesPage />} />
          <Route path="schedules" element={<SchedulePage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;