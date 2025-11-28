export default function GameCard({ game }) {
  return (
    <div className="game-card-box">
      <img
        src={game.cover_url}
        alt={game.title}
        className="game-cover"
      />

      <div className="game-info">
        <h4 className="game-title">{game.title}</h4>
        <p className="game-genre">{game.genre}</p>
      </div>
    </div>
  );
}
