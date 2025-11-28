import { supabase } from "../config/supabaseClient";

export const authService = {
  // REGISTER USER
  async register(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { success: false, message: error.message };

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // LOGIN USER
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, message: error.message };

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // LOGOUT
  async logout() {
    await supabase.auth.signOut();
  },
};
