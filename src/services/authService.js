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
      console.log("[authService] Attempting to register:", email);
      
      // Validate email and password
      if (!email || !email.includes("@")) {
        return { success: false, message: "Please enter a valid email address" };
      }
      
      if (!password || password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters" };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("[authService] SignUp error:", error);
        // Provide more user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please try logging in instead.";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address";
        } else if (error.message.includes("Password")) {
          errorMessage = "Password does not meet requirements";
        }
        return { success: false, message: errorMessage };
      }

      // If user is created but email confirmation is required
      if (data.user && !data.session) {
        console.log("[authService] User created, email confirmation required");
        return { 
          success: true, 
          user: data.user,
          requiresConfirmation: true,
          message: "Please check your email to confirm your account"
        };
      }

      // Create profile record (non-blocking - don't fail if this errors)
      if (data.user?.id) {
        const profileCreated = await ensureProfileExists(data.user.id, email);
        if (!profileCreated) {
          console.warn("[authService] Profile creation failed, but user is registered");
        }
      }

      return { success: true, user: data.user };
    } catch (err) {
      console.error("[authService] Register exception:", err);
      return { success: false, message: err.message || "Registration failed. Please try again." };
    }
  },

  // LOGIN USER
  async login(email, password) {
    try {
      console.log("[authService] Attempting to login:", email);
      
      // Validate inputs
      if (!email || !email.includes("@")) {
        return { success: false, message: "Please enter a valid email address" };
      }
      
      if (!password) {
        return { success: false, message: "Please enter your password" };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("[authService] SignIn error:", error);
        // Provide more user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email address before logging in. Check your inbox for the confirmation link.";
        } else if (error.message.includes("too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        }
        return { success: false, message: errorMessage };
      }

      if (!data.user) {
        return { success: false, message: "Login failed. Please try again." };
      }

      // Ensure profile exists (in case it was missed during registration)
      await ensureProfileExists(data.user.id, email);

      return { success: true, user: data.user };
    } catch (err) {
      console.error("[authService] Login exception:", err);
      return { success: false, message: err.message || "Login failed. Please try again." };
    }
  },

  // LOGOUT
  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[authService] Logout error:", err);
    }
  },
};
