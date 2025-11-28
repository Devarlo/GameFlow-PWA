// src/services/dashboardService.js
import { supabase } from "../config/supabaseClient";

// Ambil 5 game release terbaru
export async function getNewGames() {
  const { data, error } = await supabase
    .from("v_games_full")
    .select("*")
    .order("release_date", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching new games:", error);
    return [];
  }
  return data;
}

// Ambil 5 game rating tertinggi
export async function getTrendingGames() {
  const { data, error } = await supabase
    .from("v_games_full")
    .select("*")
    .order("average_rating", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching trending games:", error);
    return [];
  }
  return data;
}
