import supabase from "../Config/supabaseClient.js";

export const GenreModel = {
  getAll() {
    return supabase.from("genres").select("*");
  },

  create(data) {
    return supabase.from("genres").insert([data]).select().single();
  }
};
