import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logo from "/GameFlow.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/app/dashboard");   // always go to dashboard
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <img
        src={logo}
        alt="App Logo"
        className="w-32 h-32 splash-logo mb-6"
      />
      <div className="splash-loader"></div>
    </div>
  );
}
