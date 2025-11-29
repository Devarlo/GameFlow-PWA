import { Link } from "react-router-dom";
import "./GameCard.css";

export default function GameCard({ game }) {
  return (
    <Link to={`/app/game/${game.slug}`} className="game-card-box">
      <img src={game.cover_url} alt={game.title} className="game-cover" />

      <div className="game-info">
        <h4 className="game-title">{game.title}</h4>
        <div className="game-genre">
          {Array.isArray(game.genres_list)
            ? game.genres_list.map((g) => g.name).join(", ")
            : "Unknown"}
          {" • "}
          {Array.isArray(game.platforms_list)
            ? game.platforms_list.map((p) => p.name).join(", ")
            : "Unknown"}
        </div>
      </div>
    </Link>
  );
}
