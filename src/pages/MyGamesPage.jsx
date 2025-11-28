import { useState } from "react";
import "./MyGamesPage.css";

const playedDummy = [
  {
    id: 1,
    title: "Elden Ring",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.png",
    genre: "RPG",
    rating: 5,
  },
];

const wishlistDummy = [
  {
    id: 2,
    title: "Ghost of Tsushima",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x5r.png",
    genre: "Action",
  },
];

function MyGamesPage() {
  const [activeTab, setActiveTab] = useState("played");
  const [playedGames, setPlayedGames] = useState(playedDummy);
  const [wishlistGames, setWishlistGames] = useState(wishlistDummy);

  const moveToPlayed = (game) => {
    setPlayedGames([...playedGames, { ...game, rating: 0 }]);
    setWishlistGames(wishlistGames.filter((g) => g.id !== game.id));
  };

  const removeFromWishlist = (id) => {
    setWishlistGames(wishlistGames.filter((g) => g.id !== id));
  };

  const removeFromPlayed = (id) => {
    setPlayedGames(playedGames.filter((g) => g.id !== id));
  };

  const renderGameCard = (game, type) => {
    return (
      <div key={game.id} className="game-card">
        <img src={game.cover} alt={game.title} />
        <h3>{game.title}</h3>
        <p className="genre">{game.genre}</p>

        {type === "played" ? (
          <>
            <p className="rating">⭐ {game.rating}/5</p>
            <button
              className="delete-btn"
              onClick={() => removeFromPlayed(game.id)}
            >
              Hapus
            </button>
          </>
        ) : (
          <>
            <button className="move-btn" onClick={() => moveToPlayed(game)}>
              ✔ Mark as Played
            </button>
            <button
              className="delete-btn"
              onClick={() => removeFromWishlist(game.id)}
            >
              Hapus
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="my-games-container">
      <h1 className="title">📚 My Games</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "played" ? "active" : ""}
          onClick={() => setActiveTab("played")}
        >
          Played
        </button>

        <button
          className={activeTab === "wishlist" ? "active" : ""}
          onClick={() => setActiveTab("wishlist")}
        >
          Wishlist
        </button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="label">Played</span>
          <span className="value">{playedGames.length}</span>
        </div>
        <div className="stat-card">
          <span className="label">Wishlist</span>
          <span className="value">{wishlistGames.length}</span>
        </div>
      </div>

      {/* Game Grids */}
      <div className="games-grid">
        {activeTab === "played" &&
          playedGames.map((g) => renderGameCard(g, "played"))}

        {activeTab === "wishlist" &&
          wishlistGames.map((g) => renderGameCard(g, "wishlist"))}
      </div>
    </div>
  );
}

export default MyGamesPage;
