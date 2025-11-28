import { useState, useEffect, useCallback } from "react";
import * as myGamesService from "../services/myGamesService";
import { useAuth } from "./useAuth";

/**
 * useMyGames
 * provides:
 *  - myGames: array
 *  - loading
 *  - refresh()
 *  - add(gameId, status, notes)
 *  - remove(id or {userId, gameId})
 *  - update(id, data)
 */
export function useMyGames() {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setMyGames([]);
      return;
    }
    setLoading(true);
    try {
      const data = await myGamesService.getMyGamesByUser(userId);
      setMyGames(data || []);
    } catch (err) {
      console.error("useMyGames refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (gameId, status = "wishlist", notes = "") => {
      if (!userId) throw new Error("Not authenticated");
      const newRow = await myGamesService.addToMyGames(userId, gameId, status, notes);
      // prepend for immediacy
      setMyGames((prev) => [newRow, ...prev]);
      return newRow;
    },
    [userId]
  );

  const remove = useCallback(
    async ({ id = null, gameId = null }) => {
      if (!userId) throw new Error("Not authenticated");
      if (!id && !gameId) throw new Error("Need id or gameId");
      await myGamesService.removeFromMyGames({ id, userId, gameId });
      // update local state
      setMyGames((prev) =>
        prev.filter((m) => {
          if (id) return m.id !== id;
          return m.game_id !== gameId;
        })
      );
      return true;
    },
    [userId]
  );

  const update = useCallback(
    async (id, data) => {
      const updated = await myGamesService.updateMyGame(id, data);
      setMyGames((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    []
  );

  return { myGames, loading, refresh, add, remove, update };
}
