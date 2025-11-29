import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGameBySlug, updateMyGame } from "../services/gameService";
import { addToMyGames as addToMyGamesService } from "../services/myGamesService";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../config/supabaseClient";
import "./GameDetailPage.css";

export default function GameDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [myEntry, setMyEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("wishlist");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data } = await getGameBySlug(slug);
      setGame(data);

      if (user) {
        const { data: entry } = await supabase
          .from("my_games")
          .select("*")
          .eq("user_id", user.id)
          .eq("game_id", data.id)
          .single();

        setMyEntry(entry);
      }
      setLoading(false);
    }

    load();
  }, [slug, user]);

  if (loading) return <p className="detail-loading">Loading...</p>;
  if (!game) return <p className="detail-error">Game not found.</p>;

  function handleAdd() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setSelectedStatus("wishlist");
    setShowStatusSelector(true);
  }

  async function handleConfirmAdd() {
    try {
      const data = await addToMyGamesService(
        user.id,
        game.id,
        selectedStatus,
        ""
      );
      setMyEntry(data);
      setShowStatusSelector(false);
      window.dispatchEvent(new CustomEvent("mygames:updated"));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error(err);
      setShowStatusSelector(false);
    }
  }

  async function handleUpdate(field, value) {
    if (!myEntry) return;
    const { data } = await updateMyGame(myEntry.id, { [field]: value });
    setMyEntry(data);
  }

  return (
    <div className="detail-container">
      <div className="gf-inner">

        <div className="detail-grid">

          <div className="detail-left">
            <img
              src={game.cover_url}
              className="detail-cover"
              alt={game.title}
            />
          </div>

          <div className="detail-right">
            <h1 className="detail-title">{game.title}</h1>

            <p className="detail-desc">{game.description}</p>

            <div className="detail-meta">
              <p><strong>Genres:</strong> {game.genres_list?.map((g) => g.name).join(", ")}</p>
              <p><strong>Platforms:</strong> {game.platforms_list?.map((p) => p.name).join(", ")}</p>
              <p><strong>Developer:</strong> {game.developer?.name}</p>
              <p><strong>Publisher:</strong> {game.publisher?.name}</p>
            </div>

            {/* ADD */}
            {user && !myEntry && (
              <button className="detail-add-btn" onClick={handleAdd}>
                + Add to My Games
              </button>
            )}

            {!user && (
              <p>Please <a href="/login">log in</a> to add this game.</p>
            )}

            {/* MY ENTRY */}
            {user && myEntry && (
              <div className="detail-my-controls">
                <p className="detail-added">Added to your library</p>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="detail-update-btn"
                    onClick={() => handleUpdate("status", "playing")}
                  >
                    Mark Playing
                  </button>

                  <button
                    className="detail-update-btn"
                    onClick={() => handleUpdate("status", "completed")}
                  >
                    Mark Completed
                  </button>

                  <Link
                    to="/app/mygames"
                    className="detail-update-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    Go to My Games
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* STATUS MODAL */}
        {showStatusSelector && (
          <div className="modal-overlay" onClick={() => setShowStatusSelector(false)}>
            <div className="status-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Select status to add</h3>

              <div className="status-options">

                <label>
                  <input
                    type="radio"
                    name="status"
                    value="wishlist"
                    checked={selectedStatus === "wishlist"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  />
                  Wishlist
                </label>

                <label>
                  <input
                    type="radio"
                    name="status"
                    value="playing"
                    checked={selectedStatus === "playing"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  />
                  Playing
                </label>

                <label>
                  <input
                    type="radio"
                    name="status"
                    value="completed"
                    checked={selectedStatus === "completed"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  />
                  Completed
                </label>

              </div>

              <div className="status-actions">
                <button className="detail-add-btn" onClick={handleConfirmAdd}>
                  Add
                </button>
                <button
                  className="detail-update-btn"
                  onClick={() => setShowStatusSelector(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {showToast && <div className="gf-toast">Added to My Games</div>}

      </div>
    </div>
  );
}
