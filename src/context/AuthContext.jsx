import { createContext, useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

// 🚀 Named export (WAJIB untuk useAuth bisa import)
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // null = guest
  const [loading, setLoading] = useState(true);

  // Load auth state dari Supabase session
  useEffect(() => {
    // Check initial session
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Also sync to localStorage for backward compatibility
          localStorage.setItem("user", JSON.stringify(session.user));
        } else {
          // Check localStorage as fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setUser(parsed);
            } catch (e) {
              localStorage.removeItem("user");
            }
          }
        }
      } catch (error) {
        console.error("[AuthContext] Error getting session:", error);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthContext] Auth state changed:", event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem("user", JSON.stringify(session.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export default optional
export default AuthProvider;
