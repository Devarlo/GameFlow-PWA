import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import "./GameDetailPage.css";

export default function GameDetailPage() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // user library states
  const [myStatus, setMyStatus] = useState("");
  const [rating, setRating] = useState(0);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");

  // load game detail from supabase
  useEffect(() => {
    async function loadGame() {
      const { data, error } = await supabase
        .from("v_games_full")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setGame(data);
      setLoading(false);
    }

    loadGame();
  }, [id]);

  // load my_games entry (if exists)
  useEffect(() => {
    async function loadMyGame() {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const { data } = await supabase
        .from("my_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", id)
        .maybeSingle();

      if (data) {
        setMyStatus(data.status);
        setProgress(data.progress || 0);
        setRating(data.rating || 0);
        setNotes(data.notes || "");
      }
    }

    loadMyGame();
  }, [id]);

  // add to library
  async function addToMyGames() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return alert("You must login first!");

    const { error } = await supabase.from("my_games").insert([
      {
        user_id: userId,
        game_id: id,
        status: "wishlist",
      },
    ]);

    if (!error) {
      setMyStatus("wishlist");
      alert("Added to your library!");
    }
  }

  // update library
  async function updateLibrary(field, value) {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    await supabase
      .from("my_games")
      .update({ [field]: value })
      .eq("user_id", userId)
      .eq("game_id", id);

    if (field === "status") setMyStatus(value);
    if (field === "rating") setRating(value);
    if (field === "progress") setProgress(value);
    if (field === "notes") setNotes(value);
  }

  if (loading) return <p className="gd-loading">Loading...</p>;
  if (!game) return <p className="gd-error">Game not found.</p>;

  return (
    <div className="gd-container">

      {/* COVER */}
      <img src={game.cover_url} className="gd-cover" />

      {/* TITLE */}
      <h1 className="gd-title">{game.title}</h1>

      {/* META */}
      <div className="gd-meta">
        <p><strong>Release:</strong> {game.release_date || "TBA"}</p>
        <p><strong>Developer:</strong> {game.developer?.name || "-"}</p>
        <p><strong>Publisher:</strong> {game.publisher?.name || "-"}</p>

        <p>
          <strong>Genres:</strong>{" "}
          {game.genres_list?.map((g) => g.name).join(", ")}
        </p>

        <p>
          <strong>Platforms:</strong>{" "}
          {game.platforms_list?.map((p) => p.name).join(", ")}
        </p>
      </div>

      {/* DESCRIPTION */}
      <p className="gd-description">{game.description}</p>

      {/* --- MY GAME ACTIONS --- */}
      <div className="gd-section-title">My Library</div>

      {!myStatus ? (
        <button className="gd-add-btn" onClick={addToMyGames}>
          + Add to My Games
        </button>
      ) : (
        <div className="gd-library">

          {/* STATUS */}
          <label>Status</label>
          <select
            value={myStatus}
            onChange={(e) => updateLibrary("status", e.target.value)}
          >
            <option value="wishlist">Wishlist</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>

          {/* RATING */}
          <label>Rating (0–10)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={rating}
            onChange={(e) => updateLibrary("rating", e.target.value)}
          />

          {/* PROGRESS */}
          <label>Progress (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => updateLibrary("progress", e.target.value)}
          />

          {/* NOTES */}
          <label>Your Notes</label>
          <textarea
            value={notes}
            onChange={(e) => updateLibrary("notes", e.target.value)}
          />

        </div>
      )}

    </div>
  );
}
