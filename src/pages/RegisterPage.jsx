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

    const res = await authService.register(email, password);

    if (res.success) {
      login(res.user);
      navigate("/app/dashboard"); // redirect setelah daftar
    } else {
      setError(res.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join GameFlow today</p>

        {error && <p className="register-error">{error}</p>}

        <form onSubmit={handleRegister} className="register-form">
        <input
          type="email"
          placeholder="Email"
          className="register-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email"
        />

        <div className="input-with-action">
          <input
           type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="register-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Password"
        />
          <button type="button" className="input-action-btn" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "Hide" : "Show"}</button>
        </div>

        <button className="register-btn" type="submit" disabled={!email || !password}>
          Register
        </button>
        </form>

        <p className="register-login-text">
          Already have an account?{" "}
          <Link to="/login" className="register-login-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
