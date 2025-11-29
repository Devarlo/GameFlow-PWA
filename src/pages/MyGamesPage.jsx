import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyGames, updateMyGame } from "../services/gameService";
import "./MyGamesPage.css";

export default function MyGamesPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);

      if (!user) {
        setGames([]);
        setLoading(false);
        return;
      }

      const data = await getMyGames(user.id);
      setGames(data || []);
      setLoading(false);
    }

    load();

    function onUpdated() {
      load();
    }
    window.addEventListener("mygames:updated", onUpdated);
    return () => window.removeEventListener("mygames:updated", onUpdated);
  }, [user]);

  if (!user) return <p className="mg-error">You must log in first.</p>;
  if (loading) return <p className="mg-loading">Loading your games...</p>;

  const filtered = games.filter((g) => {
    if (filterStatus === "all") return true;
    return g.status === filterStatus;
  });

  async function updateField(entryId, field, value) {
    const { data } = await updateMyGame(entryId, { [field]: value });

    setGames((prev) =>
      prev.map((g) => (g.id === entryId ? { ...g, ...data } : g))
    );
  }

  return (
    <div className="mg-container">
      <div className="gf-inner">

        <h2>My Games</h2>

        <div className="mg-filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="wishlist">Wishlist</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <p className="mg-empty">Your library is empty.</p>
        )}

        <div className="mg-list">
          {filtered.map((entry) => (
            <div className="mg-card" key={entry.id}>

              <Link to={`/app/game/${entry.games.slug}`} className="mg-cover-box">
                <img
                  src={entry.games.cover_url}
                  alt={entry.games.title}
                  className="mg-cover"
                />
              </Link>

              <div className="mg-info">
                <h3>{entry.games.title}</h3>

                <label>Status:</label>
                <select
                  value={entry.status}
                  onChange={(e) =>
                    updateField(entry.id, "status", e.target.value)
                  }
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="playing">Playing</option>
                  <option value="completed">Completed</option>
                </select>

                <label>Progress (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.progress ?? 0}
                  onChange={(e) =>
                    updateField(entry.id, "progress", Number(e.target.value))
                  }
                />

                <label>Rating:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={entry.rating ?? ""}
                  onChange={(e) =>
                    updateField(entry.id, "rating", Number(e.target.value))
                  }
                />
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
