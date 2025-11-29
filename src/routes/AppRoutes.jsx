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
      <Route path="/" element={<SplashScreen />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Inside App Shell */}
      <Route path="/app" element={<AppShell />}>

        {/* default redirect */}
        <Route index element={<Navigate to="/app/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="games" element={<GameDatabasePage />} />

        {/* ⭐ FIXED DETAIL PAGE ROUTE */}
        <Route path="game/:slug" element={<GameDetailPage />} />

        <Route path="minigame" element={<MiniGamePage />} />

        <Route
          path="mygames"
          element={
            <ProtectedRoute>
              <MyGamesPage />
            </ProtectedRoute>
          }
        />

        {/* unknown paths */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>

    </Routes>
  );
}
