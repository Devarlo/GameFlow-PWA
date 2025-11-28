import supabase from "../CsupabaseClient.js";

export const GameModel = {
  async getAll() {
    return await supabase.from("games").select("*");
  },

  async getById(id) {
    return await supabase.from("games").select("*").eq("id", id).single();
  },

  async create(data) {
    return await supabase.from("games").insert([data]).select().single();
  },

  async update(id, data) {
    return await supabase.from("games").update(data).eq("id", id).select().single();
  },

  async remove(id) {
    return await supabase.from("games").delete().eq("id", id);
  }
};
