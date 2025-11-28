import supabase from "../Config/supabaseClient.js";

export const PlatformModel = {
  getAll() {
    return supabase.from("platforms").select("*");
  },

  create(data) {
    return supabase.from("platforms").insert([data]).select().single();
  }
};
