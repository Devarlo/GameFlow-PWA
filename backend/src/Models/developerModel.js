import supabase from "../Config/supabaseClient.js";

export const DeveloperModel = {
  getAll() {
    return supabase.from("developers").select("*");
  },

  create(data) {
    return supabase.from("developers").insert([data]).select().single();
  }
};
