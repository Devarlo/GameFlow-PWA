import { supabase } from "../config/supabaseClient";

/**
 * Get the user's my_games rows joined with game data
 * returns array of { id, user_id, game_id, status, progress, rating, notes, added_at, games: { ... } }
 * Note: Uses session user ID for security
 */
export async function getMyGamesByUser(userId) {
  // Verify session and use session user ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error("No active session. Please log in.");
  }
  
  const sessionUserId = session.user.id;
  console.log("[myGamesService.getMyGamesByUser] Fetching for session user ID:", sessionUserId);
  console.log("[myGamesService.getMyGamesByUser] Provided userId parameter:", userId);
  
  // First, try to get just my_games entries without join to verify RLS works
  const { data: rawData, error: rawError } = await supabase
    .from("my_games")
    .select("*")
    .eq("user_id", sessionUserId)
    .order("added_at", { ascending: false });
  
  if (rawError) {
    console.error("[myGamesService.getMyGamesByUser] Error fetching my_games (no join):", rawError);
    console.error("[myGamesService.getMyGamesByUser] Error code:", rawError.code);
    console.error("[myGamesService.getMyGamesByUser] Error details:", rawError.details);
    console.error("[myGamesService.getMyGamesByUser] Error hint:", rawError.hint);
    throw rawError;
  }
  
  console.log("[myGamesService.getMyGamesByUser] Raw my_games entries (no join):", rawData?.length || 0);
  if (rawData && rawData.length > 0) {
    console.log("[myGamesService.getMyGamesByUser] Sample raw entry:", rawData[0]);
  }
  
  // Now try with join to games
  const { data, error } = await supabase
    .from("my_games")
    .select(`
      *,
      games (
        id,
        title,
        slug,
        cover_url,
        description,
        release_date
      )
    `)
    .eq("user_id", sessionUserId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("[myGamesService.getMyGamesByUser] Error with join:", error);
    console.error("[myGamesService.getMyGamesByUser] Error code:", error.code);
    console.error("[myGamesService.getMyGamesByUser] Error details:", error.details);
    console.error("[myGamesService.getMyGamesByUser] Error hint:", error.hint);
    
    // If join fails but raw data exists, return raw data with warning
    if (rawData && rawData.length > 0) {
      console.warn("[myGamesService.getMyGamesByUser] Join failed, but raw data exists. Returning raw data.");
      return rawData.map(entry => ({ ...entry, games: null }));
    }
    throw error;
  }
  
  console.log("[myGamesService.getMyGamesByUser] Data with join:", data?.length || 0);
  if (data && data.length > 0) {
    console.log("[myGamesService.getMyGamesByUser] Sample entry with join:", JSON.stringify(data[0], null, 2));
  }
  
  // Check if join failed (all entries have null games)
  const hasNullGames = data && data.length > 0 && data.every(entry => !entry.games);
  
  if (hasNullGames) {
    console.warn("[myGamesService.getMyGamesByUser] Join failed - all entries have null games. Fetching games separately...");
    
    // Extract unique game IDs
    const gameIds = [...new Set(data.map(entry => entry.game_id).filter(id => id !== null))];
    console.log("[myGamesService.getMyGamesByUser] Fetching", gameIds.length, "games separately...");
    
    // Fetch games separately
    const { data: gamesData, error: gamesError } = await supabase
      .from("games")
      .select("id, title, slug, cover_url, description, release_date")
      .in("id", gameIds);
    
    if (gamesError) {
      console.error("[myGamesService.getMyGamesByUser] Error fetching games separately:", gamesError);
      // If games fetch fails, return entries without games (they'll be filtered out)
      return [];
    }
    
    console.log("[myGamesService.getMyGamesByUser] Fetched", gamesData?.length || 0, "games separately");
    
    // Create a map of game_id -> game data
    const gamesMap = new Map();
    if (gamesData) {
      gamesData.forEach(game => {
        gamesMap.set(game.id, game);
      });
    }
    
    // Merge games data into entries
    const mergedData = data.map(entry => ({
      ...entry,
      games: gamesMap.get(entry.game_id) || null
    }));
    
    console.log("[myGamesService.getMyGamesByUser] Merged data:", mergedData.length, "entries");
    
    // Filter out entries with null games
    const validData = mergedData.filter(entry => {
      if (!entry.games) {
        console.warn("[myGamesService.getMyGamesByUser] Filtering out entry with null games (after merge):", {
          entryId: entry.id,
          gameId: entry.game_id
        });
        return false;
      }
      if (!entry.games.slug) {
        console.warn("[myGamesService.getMyGamesByUser] Filtering out entry with null slug:", {
          entryId: entry.id,
          gameId: entry.game_id,
          game: entry.games
        });
        return false;
      }
      return true;
    });
    
    console.log("[myGamesService.getMyGamesByUser] Success (with separate fetch), returned", validData.length, "valid games (from", data?.length || 0, "total)");
    return validData;
  }
  
  // Normal flow - join worked
  const validData = (data || []).filter(entry => {
    if (!entry.games) {
      console.warn("[myGamesService.getMyGamesByUser] Filtering out entry with null games:", {
        entryId: entry.id,
        gameId: entry.game_id,
        userId: entry.user_id
      });
      return false;
    }
    if (!entry.games.slug) {
      console.warn("[myGamesService.getMyGamesByUser] Filtering out entry with null slug:", {
        entryId: entry.id,
        gameId: entry.game_id,
        game: entry.games
      });
      return false;
    }
    return true;
  });
  
  console.log("[myGamesService.getMyGamesByUser] Success, returned", validData.length, "valid games (from", data?.length || 0, "total)");
  return validData;
}

/**
 * Insert new my_game row
 * returns inserted row
 * Note: userId should match the authenticated user's ID from Supabase session
 */
export async function addToMyGames(userId, gameId, status = "wishlist", notes = "") {
  console.log("[myGamesService.addToMyGames] Inserting:", { userId, gameId, status, notes });
  
  // Verify we have an active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    const error = new Error("No active session. Please log in.");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  // Use the user ID from the session to ensure it matches RLS policy
  const sessionUserId = session.user.id;
  console.log("[myGamesService.addToMyGames] Session user ID:", sessionUserId);
  console.log("[myGamesService.addToMyGames] Provided user ID:", userId);
  
  // Warn if IDs don't match, but use session ID for security
  if (sessionUserId !== userId) {
    console.warn("[myGamesService.addToMyGames] User ID mismatch! Using session user ID for security.");
  }

  const { data, error } = await supabase
    .from("my_games")
    .insert([{ user_id: sessionUserId, game_id: gameId, status, notes }])
    .select()
    .single();

  if (error) {
    console.error("[myGamesService.addToMyGames] Insert error:", error);
    console.error("[myGamesService.addToMyGames] Error code:", error.code);
    console.error("[myGamesService.addToMyGames] Error details:", error.details);
    console.error("[myGamesService.addToMyGames] Error hint:", error.hint);
    console.error("[myGamesService.addToMyGames] Session user ID used:", sessionUserId);
    throw error;
  }
  console.log("[myGamesService.addToMyGames] Insert success:", data);
  return data;
}

/**
 * Remove by id OR by (userId + gameId) if id not provided
 * Note: Uses session user ID for security
 */
export async function removeFromMyGames({ id = null, userId = null, gameId = null }) {
  // Verify session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error("No active session. Please log in.");
  }
  
  const sessionUserId = session.user.id;
  console.log("[myGamesService.removeFromMyGames] Removing entry:", { id, userId, gameId });
  
  if (id) {
    const { error } = await supabase
      .from("my_games")
      .delete()
      .eq("id", id)
      .eq("user_id", sessionUserId); // Ensure user can only delete their own entries
    
    if (error) {
      console.error("[myGamesService.removeFromMyGames] Error (by id):", error);
      throw error;
    }
    console.log("[myGamesService.removeFromMyGames] Successfully removed entry:", id);
    return true;
  }

  if (gameId) {
    const { error } = await supabase
      .from("my_games")
      .delete()
      .match({ user_id: sessionUserId, game_id: gameId });
    
    if (error) {
      console.error("[myGamesService.removeFromMyGames] Error (by user+game):", error);
      throw error;
    }
    console.log("[myGamesService.removeFromMyGames] Successfully removed entry for game:", gameId);
    return true;
  }

  throw new Error("removeFromMyGames needs id or gameId");
}

/**
 * Update fields on my_games (progress, rating, status, notes)
 * data: { progress, rating, status, notes }
 * Note: Uses session user ID for security
 */
export async function updateMyGame(id, data) {
  // Verify session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error("No active session. Please log in.");
  }
  
  const sessionUserId = session.user.id;
  console.log("[myGamesService.updateMyGame] Updating entry:", id, "with data:", data, "for user:", sessionUserId);
  
  // First, verify the entry exists and belongs to the user
  const { data: existingEntry, error: checkError } = await supabase
    .from("my_games")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", sessionUserId)
    .single();
  
  if (checkError || !existingEntry) {
    console.error("[myGamesService.updateMyGame] Entry not found or access denied:", checkError);
    throw new Error("Entry not found or you don't have permission to update it.");
  }
  
  // Now perform the update
  const { data: updated, error } = await supabase
    .from("my_games")
    .update(data)
    .eq("id", id)
    .eq("user_id", sessionUserId) // Ensure user can only update their own entries
    .select()
    .single();

  if (error) {
    console.error("[myGamesService.updateMyGame] Error:", error);
    console.error("[myGamesService.updateMyGame] Error code:", error.code);
    console.error("[myGamesService.updateMyGame] Error details:", error.details);
    console.error("[myGamesService.updateMyGame] Error hint:", error.hint);
    
    // If it's a PGRST116 error (no rows), it means RLS policy blocked the update
    if (error.code === "PGRST116") {
      throw new Error("Update failed. Please check RLS policies for UPDATE operation on my_games table.");
    }
    
    throw error;
  }
  
  if (!updated) {
    throw new Error("Update failed: No rows were updated.");
  }
  
  console.log("[myGamesService.updateMyGame] Update success:", updated);
  return updated;
}

/**
 * Get single my_game row by user+game (useful to check if a game already in user's library)
 * Note: Uses session user ID for security
 */
export async function getMyGameForUser(userId, gameId) {
  // Verify session and use session user ID
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return null; // No session, so no entry
  }
  
  const sessionUserId = session.user.id;
  const { data, error } = await supabase
    .from("my_games")
    .select("*")
    .match({ user_id: sessionUserId, game_id: gameId })
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows (varies)
    // When no row found, supabase returns error with code 404-ish, but .single() may error.
    // We'll treat data === null as not found.
    console.warn("getMyGameForUser warning:", error);
  }
  return data || null;
}
