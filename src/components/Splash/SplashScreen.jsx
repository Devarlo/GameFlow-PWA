import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./SplashScreen.css";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigate("/app/dashboard");
      } else {
        navigate("/login");
      }
    }, 1800); // 1.8 sec splash duration

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="splash-container">
      <h1 className="splash-logo">GameFlow</h1>
      <div className="splash-loader"></div>
    </div>
  );
}
