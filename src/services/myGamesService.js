import { supabase } from "../config/supabaseClient";

/**
 * Get the user's my_games rows joined with game data
 * returns array of { id, user_id, game_id, status, progress, rating, notes, added_at, games: { ... } }
 */
export async function getMyGamesByUser(userId) {
  const { data, error } = await supabase
    .from("my_games")
    .select("*, games(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("getMyGamesByUser error:", error);
    throw error;
  }
  return data;
}

/**
 * Insert new my_game row
 * returns inserted row
 */
export async function addToMyGames(userId, gameId, status = "wishlist", notes = "") {
  const { data, error } = await supabase
    .from("my_games")
    .insert([{ user_id: userId, game_id: gameId, status, notes }])
    .select()
    .single();

  if (error) {
    console.error("addToMyGames error:", error);
    throw error;
  }
  return data;
}

/**
 * Remove by id OR by (userId + gameId) if id not provided
 */
export async function removeFromMyGames({ id = null, userId = null, gameId = null }) {
  if (id) {
    const { error } = await supabase.from("my_games").delete().eq("id", id);
    if (error) {
      console.error("removeFromMyGames error (by id):", error);
      throw error;
    }
    return true;
  }

  if (userId && gameId) {
    const { error } = await supabase
      .from("my_games")
      .delete()
      .match({ user_id: userId, game_id: gameId });
    if (error) {
      console.error("removeFromMyGames error (by user+game):", error);
      throw error;
    }
    return true;
  }

  throw new Error("removeFromMyGames needs id or (userId+gameId)");
}

/**
 * Update fields on my_games (progress, rating, status, notes)
 * data: { progress, rating, status, notes }
 */
export async function updateMyGame(id, data) {
  const { data: updated, error } = await supabase
    .from("my_games")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateMyGame error:", error);
    throw error;
  }
  return updated;
}

/**
 * Get single my_game row by user+game (useful to check if a game already in user's library)
 */
export async function getMyGameForUser(userId, gameId) {
  const { data, error } = await supabase
    .from("my_games")
    .select("*")
    .match({ user_id: userId, game_id: gameId })
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows (varies)
    // When no row found, supabase returns error with code 404-ish, but .single() may error.
    // We'll treat data === null as not found.
    console.warn("getMyGameForUser warning:", error);
  }
  return data || null;
}
