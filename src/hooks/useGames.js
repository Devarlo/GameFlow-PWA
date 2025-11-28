// src/hooks/useGames.js
import { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("v_games_full")
        .select("*")
        .order("title");

      if (!error) setGames(data);
      setLoading(false);
    }

    load();
  }, []);

  return { games, loading };
}
