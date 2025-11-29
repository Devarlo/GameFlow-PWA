import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getGameBySlug } from "../services/gameService";
import { addToMyGames as addToMyGamesService, updateMyGame, removeFromMyGames } from "../services/myGamesService";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../config/supabaseClient";
import "./GameDetailPage.css";

export default function GameDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [myEntry, setMyEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("wishlist");
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        console.log("[GameDetail] Loading game with slug:", slug);
        const { data, error: gameError } = await getGameBySlug(slug);
        
        if (gameError) {
          console.error("[GameDetail] Error loading game:", gameError);
          setError("Failed to load game.");
          setGame(null);
          return;
        }
        
        setGame(data || null);
        console.log("[GameDetail] Game loaded:", data?.id, data?.title);

        if (user && data) {
          // Use session user ID for security
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const sessionUserId = session.user.id;
            console.log("[GameDetail] Checking my_games for user:", sessionUserId, "game:", data.id);
            
            const { data: entry, error: entryError } = await supabase
              .from("my_games")
              .select("*")
              .eq("user_id", sessionUserId)
              .eq("game_id", data.id)
              .single();

            if (entryError && entryError.code !== "PGRST116") {
              console.warn("[GameDetail] Error checking my_games:", entryError);
            }
            
            setMyEntry(entry || null);
            console.log("[GameDetail] My entry:", entry ? "Found" : "Not found");
          } else {
            setMyEntry(null);
          }
        } else {
          setMyEntry(null);
        }
      } catch (err) {
        console.error("[GameDetail] load error", err);
        setError("Failed to load game.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, user]);

  if (loading) return <div className="detail-loading centered-block">Loading...</div>;
  if (!game) return <div className="detail-error centered-block">Game not found.</div>;

  function handleAddClick() {
    if (!user) {
      // redirect to login but preserve location (optional)
      navigate("/login");
      return;
    }
    setSelectedStatus("wishlist");
    setShowStatusSelector(true);
  }

  async function handleConfirmAdd() {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setError(""); // Clear previous errors
      const data = await addToMyGamesService(user.id, game.id, selectedStatus, "");
      setMyEntry(data);
      setShowStatusSelector(false);
      window.dispatchEvent(new CustomEvent("mygames:updated"));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error("[GameDetail] add error", err);
      
      // Provide more specific error messages
      let errorMessage = "Failed to add to My Games.";
      if (err.code === "42501") {
        errorMessage = "Permission denied. Please check your account settings or contact support.";
      } else if (err.code === "UNAUTHORIZED" || err.message?.includes("session")) {
        errorMessage = "Your session has expired. Please log in again.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setShowStatusSelector(false);
    }
  }

  async function handleUpdate(field, value) {
    if (!myEntry) return;
    try {
      console.log("[GameDetail] Updating field:", field, "to:", value);
      const updated = await updateMyGame(myEntry.id, { [field]: value });
      setMyEntry(updated);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("mygames:updated"));
    } catch (err) {
      console.error("[GameDetail] update error", err);
      setError("Failed to update. Please try again.");
    }
  }

  async function handleRemove() {
    if (!myEntry) return;
    
    if (!confirm(`Are you sure you want to remove "${game.title}" from your library?`)) {
      return;
    }
    
    try {
      await removeFromMyGames({ id: myEntry.id });
      setMyEntry(null);
      window.dispatchEvent(new CustomEvent("mygames:updated"));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error("[GameDetail] remove error", err);
      setError("Failed to remove game. Please try again.");
    }
  }

  return (
    <div className="detail-page">
      <div className="gf-inner">

        <div className="detail-panel ps-card">
          <div className="detail-grid">
            {/* Left: Cover */}
            <div className="detail-left">
              <img src={game.cover_url} alt={game.title} className="detail-cover" />
            </div>

            {/* Right: Info */}
            <div className="detail-right">
              <div className="detail-head">
                <h1 className="detail-title">{game.title}</h1>
                <div className="detail-meta-kv">
                  <span className="kicker">{game.release_date ? new Date(game.release_date).getFullYear() : "—"}</span>
                  <span className="kicker">{game.platforms_list?.map((p) => p.name).join(", ")}</span>
                </div>
              </div>

              <p className="detail-desc">{game.description}</p>

              <div className="detail-attributes">
                <div><strong>Genres:</strong> {game.genres_list?.map((g) => g.name).join(", ") || "Unknown"}</div>
                <div><strong>Developer:</strong> {game.developer?.name || "Unknown"}</div>
                <div><strong>Publisher:</strong> {game.publisher?.name || "Unknown"}</div>
              </div>

              <div className="detail-actions">
                {!user && (
                  <div className="guest-cta">
                    <button className="btn btn-primary" onClick={() => navigate("/login")}>
                      Login to Save
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate("/app/games")}>
                      Continue Browsing
                    </button>
                  </div>
                )}

                {user && !myEntry && (
                  <div className="cta-row">
                    <button className="btn btn-primary" onClick={handleAddClick}>+ Add to My Games</button>
                    <Link to="/app/games" className="btn btn-ghost" style={{ textDecoration: "none" }}>Back to Database</Link>
                  </div>
                )}

                {user && myEntry && (
                  <div className="myentry-panel">
                    <div className="detail-added">In your library • <strong>{myEntry.status}</strong></div>
                    
                    <div className="entry-controls">
                      <select
                        className="input"
                        value={myEntry.status}
                        onChange={(e) => handleUpdate("status", e.target.value)}
                        style={{ marginBottom: "10px", width: "100%" }}
                      >
                        <option value="wishlist">Wishlist</option>
                        <option value="playing">Playing</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                        <Link to="/app/mygames" className="btn btn-primary" style={{ flex: 1, textDecoration: "none", textAlign: "center" }}>View Library</Link>
                        <button className="btn btn-ghost" onClick={handleRemove} style={{ flex: 1 }}>Remove</button>
                      </div>
                    </div>

                    <div className="entry-fields">
                      <label>Progress (%)</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        value={myEntry.progress ?? 0}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : Number(e.target.value);
                          handleUpdate("progress", value);
                        }}
                        onBlur={(e) => {
                          const value = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          if (value !== (myEntry.progress ?? 0)) {
                            handleUpdate("progress", value);
                          }
                        }}
                      />

                      <label>Rating (1-5)</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="5"
                        value={myEntry.rating ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          handleUpdate("rating", value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value === "" ? null : Math.max(1, Math.min(5, Number(e.target.value) || 1));
                          if (value !== (myEntry.rating ?? null)) {
                            handleUpdate("rating", value);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showStatusSelector && (
          <div className="modal-overlay" onClick={() => setShowStatusSelector(false)}>
            <div className="status-modal ps-card" onClick={(e) => e.stopPropagation()}>
              <h3>Select status to add</h3>

              <div className="status-options">
                <label className="status-option">
                  <input type="radio" name="status" value="wishlist" checked={selectedStatus === "wishlist"} onChange={(e) => setSelectedStatus(e.target.value)} />
                  Wishlist
                </label>

                <label className="status-option">
                  <input type="radio" name="status" value="playing" checked={selectedStatus === "playing"} onChange={(e) => setSelectedStatus(e.target.value)} />
                  Playing
                </label>

                <label className="status-option">
                  <input type="radio" name="status" value="completed" checked={selectedStatus === "completed"} onChange={(e) => setSelectedStatus(e.target.value)} />
                  Completed
                </label>
              </div>

              <div className="status-actions">
                <button className="btn btn-primary" onClick={handleConfirmAdd}>Add</button>
                <button className="btn btn-ghost" onClick={() => setShowStatusSelector(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showToast && <div className="gf-toast">{myEntry ? "Removed from My Games" : "Added to My Games"}</div>}
        {error && <div className="detail-error-msg">{error}</div>}

      </div>
    </div>
  );
}
