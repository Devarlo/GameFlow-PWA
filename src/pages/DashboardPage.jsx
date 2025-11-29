import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getNewGames, getTrendingGames } from "../services/dashboardService";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newGames, setNewGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const ng = await getNewGames();
      const tg = await getTrendingGames();
      setNewGames(ng || []);
      setTrendingGames(tg || []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="gf-inner">

        {/* GREETING */}
        <div className="dash-greeting ps-card">
          <div className="dash-avatar">
            <img src="/GameFlow.png" alt="Logo" />
          </div>

          <div className="dash-greet-text">
            <h2 className="greet-title">Welcome, {user?.email}</h2>
            <p classname="greet-sub">Find your next favorite game</p>
          </div>
        </div>

        {/* QUICK MENU */}
        <div className="quick-row">
          <div className="quick-card" onClick={() => navigate("/app/games")}>
            <span className="qi-icon">🎮</span>
            <p>Game Database</p>
          </div>

          <div className="quick-card" onClick={() => navigate("/app/minigame")}>
            <span className="qi-icon">🕹️</span>
            <p>Mini Game</p>
          </div>

          <div className="quick-card" onClick={() => navigate("/app/mygames")}>
            <span className="qi-icon">📚</span>
            <p>My Games</p>
          </div>
        </div>

        {/* NEW GAMES */}
        <h3 className="section-header">New Games</h3>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : newGames.length === 0 ? (
          <p className="loading-text">No new games found.</p>
        ) : (
          <div className="scroll-strip">
            {newGames.map((game) => (
              <div key={game.id} className="game-tile">
                <img src={game.cover_url} alt={game.title} />
                <p>{game.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* TRENDING */}
        <h3 className="section-header">Trending</h3>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : trendingGames.length === 0 ? (
          <p className="loading-text">No trending games found.</p>
        ) : (
          <div className="scroll-strip small">
            {trendingGames.map((game) => (
              <div key={game.id} className="game-tile">
                <img src={game.cover_url} alt={game.title} />
                <p>{game.title}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
