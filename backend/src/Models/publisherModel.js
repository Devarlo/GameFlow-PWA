import supabase from "../Config/supabaseClient.js";

export const PublisherModel = {
  getAll() {
    return supabase.from("publishers").select("*");
  },

  create(data) {
    return supabase.from("publishers").insert([data]).select().single();
  }
};
