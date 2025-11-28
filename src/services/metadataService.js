import { supabase } from "../config/supabaseClient";

export async function getGenres() {
  return await supabase.from("genres").select("*");
}

export async function getPlatforms() {
  return await supabase.from("platforms").select("*");
}

export async function getDevelopers() {
  return await supabase.from("developers").select("*");
}

export async function getPublishers() {
  return await supabase.from("publishers").select("*");
}
