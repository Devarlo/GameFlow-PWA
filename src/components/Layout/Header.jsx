import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <h1 className="header-logo">GameFlow</h1>

      {/* RIGHT SIDE */}
      <div className="header-right">
        {user ? (
          <div
            className="header-profile-icon"
            onClick={() => navigate("/app/profile")}
          >
            👤
          </div>
        ) : (
          <button
            className="header-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
