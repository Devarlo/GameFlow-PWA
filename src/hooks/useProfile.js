
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error) setProfile(data);
    }

    loadProfile();
  }, [userId]);

  return { profile };
}
