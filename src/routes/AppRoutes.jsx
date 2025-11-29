import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import SplashScreen from "../components/Splash/SplashScreen";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import GameDatabasePage from "../pages/GameDatabasePage";
import MiniGamePage from "../pages/MiniGamePage";
import MyGamesPage from "../pages/MyGamesPage";
import GameDetailPage from "../pages/GameDetailPage";

import AppShell from "../components/Layout/AppShell";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>

      {/* Splashscreen → langsung ke dashboard tanpa login */}
      <Route path="/" element={<SplashScreen />} />

      {/* Auth pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* APP STRUCTURE */}
      <Route path="/app" element={<AppShell />}>

        {/* Default route → dashboard */}
        <Route index element={<Navigate to="/app/dashboard" replace />} />

        {/* bebas akses */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="games" element={<GameDatabasePage />} />
        <Route path="game/:slug" element={<GameDetailPage />} />
        <Route path="minigame" element={<MiniGamePage />} />

        {/* HANYA ini yang memerlukan login */}
        <Route
          path="mygames"
          element={
            <ProtectedRoute>
              <MyGamesPage />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>

    </Routes>
  );
}
