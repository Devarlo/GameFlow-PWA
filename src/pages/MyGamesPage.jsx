import { useState } from "react";
import { useMyGames } from "../hooks/useMyGames";
import "./MyGamesPage.css";

export default function MyGamesPage() {
  const { myGames, loading, remove, update } = useMyGames();
  const [savingId, setSavingId] = useState(null);

  if (loading) return <p style={{ color: "white" }}>Loading your games...</p>;

  if (!myGames || myGames.length === 0) {
    return <p style={{ color: "white" }}>Your library is empty.</p>;
  }

  async function handleQuickUpdate(id, data) {
    setSavingId(id);
    try {
      await update(id, data);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this game from your library?")) return;
    try {
      await remove({ id });
    } catch (err) {
      console.error(err);
      alert("Failed to remove");
    }
  }

  return (
    <div className="mg-container">
      <h2>Your Games</h2>

      <div className="mg-grid">
        {myGames.map((row) => (
          <div className="mg-card" key={row.id}>
            <img src={row.games?.cover_url} alt={row.games?.title} />
            <h4>{row.games?.title}</h4>

            <div className="mg-meta">
              <div>Status: {row.status}</div>
              <div>Progress: {row.progress ?? 0}%</div>
              <div>Rating: {row.rating ?? "-"}</div>
            </div>

            <div className="mg-controls">
              <button onClick={() => handleQuickUpdate(row.id, { status: row.status === "wishlist" ? "playing" : "completed" })}>
                Toggle
              </button>

              <button onClick={() => handleQuickUpdate(row.id, { progress: Math.min(100, (row.progress || 0) + 10) })}>
                +10%
              </button>

              <button onClick={() => handleRemove(row.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
