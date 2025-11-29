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
       <img
          src="/public/GameFlow.png"
          alt="App Logo"
          className="w-32 h-32 splash-logo mb-6"
        />
      <div className="splash-loader"></div>
    </div>
  );
}
