import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getNewGames, getTrendingGames } from "../services/dashboardService";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();

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
    <div className="dashboard-container">
      <div className="gf-inner">

        {/* GREETING */}
        <div className="dashboard-greeting">
          <div className="greeting-avatar">🎮</div>

          <div>
            <span>Welcome, {user?.email}</span>
            <div className="greeting-sub">Find your next game — curated picks for you</div>
          </div>
        </div>

        {/* QUICK MENU */}
        <div className="quick-menu">
          <div
            className="quick-item"
            onClick={() => (window.location.href = "/app/games")}
          >
            <div className="qi-icon">🎲</div>
            <p>Game Database</p>
          </div>

          <div
            className="quick-item"
            onClick={() => (window.location.href = "/app/minigame")}
          >
            <div className="qi-icon">🕹️</div>
            <p>Mini Game</p>
          </div>

          <div
            className="quick-item"
            onClick={() => (window.location.href = "/app/mygames")}
          >
            <div className="qi-icon">📚</div>
            <p>My Games</p>
          </div>
        </div>

        {/* NEW GAMES */}
        <h3 className="section-title">New Games</h3>

        {loading ? (
          <p>Loading...</p>
        ) : newGames.length === 0 ? (
          <p>No new games found.</p>
        ) : (
          <div className="scroll-row">
            {newGames.map((game) => (
              <div key={game.id} className="game-card">
                <img src={game.cover_url} alt={game.title} />
                <p>{game.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* TRENDING */}
        <h3 className="section-title">Trending</h3>

        {loading ? (
          <p>Loading...</p>
        ) : trendingGames.length === 0 ? (
          <p>No trending games found.</p>
        ) : (
          <div className="scroll-row small">
            {trendingGames.map((game) => (
              <div key={game.id} className="game-card">
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
