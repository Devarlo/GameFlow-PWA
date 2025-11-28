import { supabase } from "../config/supabaseClient";

// Fetch game dari view v_games_full
export async function getAllGames() {
  const { data, error } = await supabase
    .from("v_games_full")
    .select("*");

  if (error) {
    console.error("Supabase Error:", error);
    return { error };
  }

  return { data };
}
