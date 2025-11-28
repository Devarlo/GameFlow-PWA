import { supabase } from "../config/supabaseClient";

/* =======================================
   1. GET ALL GAMES (VIEW)
   ======================================= */
export async function getAllGames() {
  const { data, error } = await supabase
    .from("v_games_full")
    .select("*");

  if (error) {
    console.error("Supabase Error (getAllGames):", error);
    return { error };
  }

  return { data };
}

/* =======================================
   2. GET NEWEST GAMES
   ======================================= */
export async function getNewGames(limit = 10) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase Error (getNewGames):", error);
    throw error;
  }

  return data;
}

/* =======================================
   3. GET TRENDING GAMES
      (Based on most saved by users)
   ======================================= */
export async function getTrendingGames(limit = 10) {
  const { data, error } = await supabase
    .from("my_games")
    .select(
      `
      game_id,
      games (*),
      count:game_id(count)
      `
    )
    .group("game_id, games.id")
    .order("count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase Error (getTrendingGames):", error);
    throw error;
  }

  // extract games only
  return data.map((entry) => entry.games);
}
