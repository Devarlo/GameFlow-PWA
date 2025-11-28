import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dummy New Games
  const newGames = [
    { id: 1, title: "Stellar Blade", cover: "https://via.placeholder.com/150" },
    { id: 2, title: "Monster Hunter Wilds", cover: "https://via.placeholder.com/150" },
    { id: 3, title: "GTAVI", cover: "https://via.placeholder.com/150" },
    { id: 4, title: "Zenless Zone Zero", cover: "https://via.placeholder.com/150" },
  ];

  // Dummy Trending
  const trendingGames = [
    { id: 1, title: "Elden Ring", cover: "https://via.placeholder.com/150" },
    { id: 2, title: "Genshin Impact", cover: "https://via.placeholder.com/150" },
    { id: 3, title: "Fortnite", cover: "https://via.placeholder.com/150" },
    { id: 4, title: "Palworld", cover: "https://via.placeholder.com/150" },
  ];

  return (
    <div className="dashboard-container">

      {/* GREETING */}
      <h2 className="dashboard-greeting">
        Welcome {user ? user.email : "Guest"} 👋
      </h2>

      {/* QUICK MENU */}
      <div className="quick-menu">
        <div className="quick-item" onClick={() => navigate("/app/games")}>
          🎮 <p>Game Database</p>
        </div>

        <div className="quick-item" onClick={() => navigate("/app/minigame")}>
          🕹️ <p>Mini Game</p>
        </div>

        <div className="quick-item" onClick={() => navigate("/app/mygames")}>
          📚 <p>My Games</p>
        </div>
      </div>

      {/* NEW GAMES */}
      <h3 className="section-title">New Games</h3>
      <div className="scroll-row">
        {newGames.map((game) => (
          <div className="game-card" key={game.id}>
            <img src={game.cover} alt={game.title} />
            <p>{game.title}</p>
          </div>
        ))}
      </div>

      {/* TRENDING */}
      <h3 className="section-title">Trending</h3>
      <div className="scroll-row">
        {trendingGames.map((game) => (
          <div className="game-card" key={game.id}>
            <img src={game.cover} alt={game.title} />
            <p>{game.title}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
