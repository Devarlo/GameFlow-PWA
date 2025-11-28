import { Outlet } from "react-router-dom";
import BottomNavigator from "./BottomNavigator.jsx";
import "./AppShell.css";

export default function AppShell() {
  return (
    <div className="app-shell">

      {/* Full screen scroll area */}
      <div className="scroll-wrapper">
        <main className="app-inner">
          <Outlet />
        </main>
      </div>

      <BottomNavigator />
    </div>
  );
}
