import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterPage.css";
import { authService } from "../services/authService";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const res = await authService.register(email, password);

    if (res.success) {
      // If email confirmation is required, show message instead of auto-login
      if (res.requiresConfirmation) {
        setError(res.message || "Please check your email to confirm your account");
        // Optionally clear the form or show success message
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        login(res.user);
        navigate("/app/dashboard");
      }
    } else {
      setError(res.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Start your GameFlow journey</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleRegister} className="auth-form">

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
            Register
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
