import "./BottomNavigator.css";
import { NavLink } from "react-router-dom";

function BottomNavigator() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/app/dashboard" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <span className="icon">
          <img className="navcon" src="/home.png" alt="Home Icon" />
        </span>
        <span className="label">Home</span>
      </NavLink>
      <NavLink to="/app/games" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <span className="icon">
          <img className="navcon" src="/database.png" alt="Games Icon" />
        </span>
        <span className="label">Games</span>
      </NavLink>
      <NavLink to="/app/mygames" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <span className="icon">
          <img className="navcon" src="/gamepad.png" alt="My Games Icon" />
        </span>
        <span className="label">My Games</span>
      </NavLink>
      <NavLink to="/app/profile" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
        <span className="icon">
          <img className="navcon" src="/user.png" alt="Profile Icon" />
        </span>
        <span className="label">Profile</span>
      </NavLink>
    </nav>
  );
}

export default BottomNavigator;
