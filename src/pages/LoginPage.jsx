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
      // update auth context
      login(res.user);
      navigate("/app/dashboard"); // redirect setelah login
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login to continue</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email"
        />

        <div className="input-with-action">
          <input
           type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Password"
        />
          <button
            type="button"
            className="input-action-btn"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button className="login-btn" type="submit" disabled={!email || !password}>
          Login
        </button>
        </form>

        <p className="login-register-text">
          Don’t have an account?{" "}
          <Link to="/register" className="login-register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
