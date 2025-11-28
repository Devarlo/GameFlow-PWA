import { useEffect, useState } from "react";
import { getAllGames } from "../services/gameService";

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await getAllGames();

      if (!error && data) {
        setGames(data);
      }

      setLoading(false);
    }

    load();
  }, []);

  return { games, loading };
}
