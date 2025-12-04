
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabaseClient";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(
    async (idOverride = null) => {
      const targetId = idOverride || userId;
      if (!targetId) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetId)
        .single();

      if (error) {
        console.error("[useProfile] Error loading profile:", error);
        setError(error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;
    loadProfile(userId);
  }, [userId, loadProfile]);

  return { profile, loading, error, refreshProfile: loadProfile, setProfile };
}
