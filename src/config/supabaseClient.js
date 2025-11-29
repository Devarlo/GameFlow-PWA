import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing");
  throw new Error("Supabase configuration is missing. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
