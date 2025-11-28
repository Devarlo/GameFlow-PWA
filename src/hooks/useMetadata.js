// src/hooks/useMetadata.js
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export function useMetadata() {
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    async function load() {
      const g = await supabase.from("genres").select("*").order("name");
      const p = await supabase.from("platforms").select("*").order("name");
      const d = await supabase.from("developers").select("*").order("name");
      const pb = await supabase.from("publishers").select("*").order("name");

      if (!g.error) setGenres(g.data);
      if (!p.error) setPlatforms(p.data);
      if (!d.error) setDevelopers(d.data);
      if (!pb.error) setPublishers(pb.data);
    }

    load();
  }, []);

  return { genres, platforms, developers, publishers };
}
