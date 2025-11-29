import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyGamesByUser, updateMyGame, removeFromMyGames } from "../services/myGamesService";
import "./MyGamesPage.css";

export default function MyGamesPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      if (!user) {
        setGames([]);
        setLoading(false);
        return;
      }

      try {
        console.log("[MyGamesPage] Loading games for user:", user.id);
        setError("");
        const data = await getMyGamesByUser(user.id);
        console.log("[MyGamesPage] Loaded games:", data?.length || 0);
        console.log("[MyGamesPage] Sample entry:", data?.[0]);
        setGames(data || []);
        
        if (!data || data.length === 0) {
          setError("No games found. Try adding a game from the game database.");
        }
      } catch (error) {
        console.error("[MyGamesPage] Error loading games:", error);
        setGames([]);
        setError(error.message || "Failed to load games. Please check console for details.");
      } finally {
        setLoading(false);
      }
    }

    load();

    function onUpdated() {
      console.log("[MyGamesPage] Received mygames:updated event, reloading...");
      load();
    }
    window.addEventListener("mygames:updated", onUpdated);
    return () => window.removeEventListener("mygames:updated", onUpdated);
  }, [user]);

  if (!user) return <p className="mg-error center-text">You must log in first.</p>;
  if (loading) return <p className="mg-loading center-text">Loading your games...</p>;
  
  if (error && games.length === 0) {
    return (
      <div className="mg-page">
        <div className="gf-inner">
          <div className="mg-header">
            <h1 className="mg-title">My Games</h1>
          </div>
          <p className="mg-error center-text">{error}</p>
          <p className="mg-empty center-text" style={{ marginTop: "10px", fontSize: "14px", opacity: 0.7 }}>
            Check the browser console for detailed error information.
          </p>
        </div>
      </div>
    );
  }

  // Sort and filter games
  const sortedAndFiltered = games
    .filter((g) => {
      // Filter out entries with null games (orphaned entries)
      if (!g.games) return false;
      if (filterStatus === "all") return true;
      return g.status === filterStatus;
    })
    .sort((a, b) => {
      // Sort by status priority: playing > completed > wishlist
      const statusOrder = { playing: 1, completed: 2, wishlist: 3 };
      const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      
      // If same status, sort by added_at (newest first)
      if (statusDiff === 0) {
        const dateA = new Date(a.added_at || 0);
        const dateB = new Date(b.added_at || 0);
        return dateB - dateA;
      }
      
      return statusDiff;
    });

  async function updateField(entryId, field, value) {
    try {
      console.log("[MyGamesPage] Updating field:", field, "to:", value, "for entry:", entryId);
      const updated = await updateMyGame(entryId, { [field]: value });
      
      setGames((prev) =>
        prev.map((g) => (g.id === entryId ? { ...g, ...updated } : g))
      );
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("mygames:updated"));
    } catch (error) {
      console.error("[MyGamesPage] Error updating field:", error);
      setError("Failed to update. Please try again.");
    }
  }

  async function handleRemove(entryId, gameTitle) {
    if (!confirm(`Are you sure you want to remove "${gameTitle}" from your library?`)) {
      return;
    }
    
    try {
      console.log("[MyGamesPage] Removing entry:", entryId);
      await removeFromMyGames({ id: entryId });
      
      setGames((prev) => prev.filter((g) => g.id !== entryId));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("mygames:updated"));
    } catch (error) {
      console.error("[MyGamesPage] Error removing game:", error);
      setError("Failed to remove game. Please try again.");
    }
  }

  return (
    <div className="mg-page">
      <div className="gf-inner">

        <div className="mg-header">
          <h1 className="mg-title">My Games</h1>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mg-filter-select"
          >
            <option value="all">All</option>
            <option value="wishlist">Wishlist</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {sortedAndFiltered.length === 0 && (
          <p className="mg-empty center-text">Your library is empty.</p>
        )}

        <div className="mg-list">
          {sortedAndFiltered.map((entry) => {
            // Skip entries with null games
            if (!entry.games) {
              console.warn("[MyGamesPage] Entry with null games:", entry.id);
              return null;
            }
            
            // Ensure slug exists for routing
            if (!entry.games.slug) {
              console.warn("[MyGamesPage] Entry with null slug:", entry.id, entry.games);
              return null;
            }
            
            const gameSlug = entry.games.slug;
            console.log("[MyGamesPage] Rendering entry:", entry.id, "Game slug:", gameSlug);
            
            return (
            <div className="mg-card ps-card" key={entry.id}>

              {/* COVER */}
              <Link to={`/app/game/${gameSlug}`} className="mg-cover-box">
                <img
                  src={entry.games.cover_url || "/GameFlow.png"}
                  alt={entry.games.title || "Unknown Game"}
                  className="mg-cover"
                />
              </Link>

              {/* RIGHT CONTENT */}
              <div className="mg-info">

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 className="mg-game-title">{entry.games.title || "Unknown Game"}</h3>
                  <button
                    onClick={() => handleRemove(entry.id, entry.games.title)}
                    className="mg-remove-btn"
                    title="Remove from library"
                    style={{
                      background: "rgba(255, 60, 60, 0.2)",
                      border: "1px solid rgba(255, 120, 120, 0.3)",
                      color: "#ffb4b4",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    Remove
                  </button>
                </div>

                <div className="mg-field">
                  <label>Status</label>
                  <select
                    className="mg-input"
                    value={entry.status}
                    onChange={(e) =>
                      updateField(entry.id, "status", e.target.value)
                    }
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="playing">Playing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="mg-field">
                  <label>Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="mg-input"
                    value={entry.progress ?? 0}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number(e.target.value);
                      updateField(entry.id, "progress", value);
                    }}
                    onBlur={(e) => {
                      // Ensure value is within range
                      const value = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      if (value !== (entry.progress ?? 0)) {
                        updateField(entry.id, "progress", value);
                      }
                    }}
                  />
                </div>

                <div className="mg-field">
                  <label>Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="mg-input"
                    value={entry.rating ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : Number(e.target.value);
                      updateField(entry.id, "rating", value);
                    }}
                    onBlur={(e) => {
                      // Ensure value is within range
                      const value = e.target.value === "" ? null : Math.max(1, Math.min(5, Number(e.target.value) || 1));
                      if (value !== (entry.rating ?? null)) {
                        updateField(entry.id, "rating", value);
                      }
                    }}
                  />
                </div>

              </div>

            </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
