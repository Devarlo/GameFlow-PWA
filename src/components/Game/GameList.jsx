import GameCard from "./GameCard";
import "./GameList.css";

export default function GameList({ games = [] }) {
  if (!games.length) {
    return <p className="gamelist-empty">No games found</p>;
  }

  return (
    <div className="game-list-grid">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
