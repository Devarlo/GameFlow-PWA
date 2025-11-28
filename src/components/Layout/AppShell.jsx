import { Outlet } from "react-router-dom";
import BottomNavigator from "./BottomNavigator.jsx";
import "./AppShell.css";

export default function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet />
      </main>

      <BottomNavigator />
    </div>
  );
}
