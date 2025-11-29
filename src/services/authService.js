import { supabase } from "../config/supabaseClient";

// Helper: ensure profile exists in profiles table
async function ensureProfileExists(userId, email) {
  try {
    console.log("[authService] Ensuring profile exists for:", { userId, email });

    // Upsert minimal fields only. Some Supabase projects have a different
    // profiles schema (no email column), so sending `email` may cause
    // 'column not found' errors. We upsert only `id` and `updated_at`.
    const payload = { id: userId, updated_at: new Date() };

    const { data, error } = await supabase
      .from("profiles")
      .upsert([payload], { onConflict: "id" })
      .select()
      .single();

    if (error) {
      // If upsert fails due to schema mismatch or RLS, log and continue.
      console.error("[authService] Failed to upsert profile:", error);
      console.error("[authService] Error code:", error?.code);
      console.error("[authService] Error details:", error?.details);
      console.error("[authService] Error hint:", error?.hint);
      return false;
    }

    console.log("[authService] Profile ensured successfully:", data);
    return true;
  } catch (err) {
    console.error("[authService] ensureProfileExists error:", err);
    return false;
  }
}

export const authService = {
  // REGISTER USER
  async register(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { success: false, message: error.message };

      // Create profile record
      await ensureProfileExists(data.user.id, email);

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

      // Ensure profile exists (in case it was missed during registration)
      await ensureProfileExists(data.user.id, email);

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
