import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";
import { authService } from "../services/authService";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await authService.login(email, password);

    if (res.success) {
      login(res.user);
      navigate("/app/dashboard");
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to continue</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleLogin} className="auth-form">

          <input
            type="email"
            className="auth-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="auth-input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-action-btn"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="auth-btn" type="submit" disabled={!email || !password}>
            Login
          </button>
        </form>

        <p className="auth-switch-text">
          Don’t have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
