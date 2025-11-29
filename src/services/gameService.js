import { supabase } from "../config/supabaseClient";

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

export async function getGameBySlug(slug) {
  const { data, error } = await supabase
    .from("v_games_full")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Supabase getGameBySlug Error:", error);
    return { data: null, error };
  }

  return { data };
}

export async function addToMyGames(user_id, game_id) {
  const { data, error } = await supabase
    .from("my_games")
    .insert([{ user_id, game_id, status: "wishlist" }])
    .select()
    .single();

  if (error) {
    console.error("Supabase addToMyGames Error:", error);
    return { data: null, error };
  }

  return { data };
}

export async function updateMyGame(gameId, updates) {
  const { data, error } = await supabase
    .from("my_games")
    .update(updates)
    .eq("id", gameId)
    .select()
    .single();

  if (error) {
    console.error("Supabase updateMyGame Error:", error);
    return { data: null, error };
  }

  return { data };
}

// GET all my_games for user
export async function getMyGames(user_id) {
  console.log("[gameService.getMyGames] Fetching for user_id:", user_id);
  const { data, error } = await supabase
    .from("my_games")
    .select(`
      id,
      status,
      progress,
      rating,
      notes,
      games (*)
    `)
    .eq("user_id", user_id)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("[gameService.getMyGames] Error:", error);
    console.error("[gameService.getMyGames] Error code:", error.code);
    console.error("[gameService.getMyGames] Error details:", error.details);
    return [];
  }

  console.log("[gameService.getMyGames] Success, returned", data?.length || 0, "games");
  return data;
}
