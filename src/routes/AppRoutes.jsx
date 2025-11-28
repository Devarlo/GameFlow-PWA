import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SplashScreen from "../components/splash/SplashScreen";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import GameDatabasePage from "../pages/GameDatabasePage";
import MiniGamePage from "../pages/MiniGamePage";
import MyGamesPage from "../pages/MyGamesPage";

import AppShell from "../components/Layout/AppShell";

// Protected route untuk halaman tertentu saja
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Layout utama */}
      <Route path="/app" element={<AppShell />}>
        {/* Redirect /app to /app/dashboard */}
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="games" element={<GameDatabasePage />} />
        <Route path="minigame" element={<MiniGamePage />} />

        {/* MyGames butuh login */}
        <Route
          path="mygames"
          element={
            <ProtectedRoute>
              <MyGamesPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
