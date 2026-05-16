import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { fetchLikedSongs, toggleLike as apiToggleLike } from "../services/likeService";
import { useAuth } from "../hooks/useAuth";

const LikeContext = createContext(null);

/**
 * LikeProvider — manages a global Set of liked song IDs so that all views
 * (Home feed, PlaylistDetail, etc.) share the same liked state without
 * extra API round-trips.
 */
export function LikeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  // Set of song IDs the current user has liked
  const [likedIds, setLikedIds] = useState(new Set());
  const [initialised, setInitialised] = useState(false);

  // Fetch the user's liked songs once on login / mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLikedIds(new Set());
      setInitialised(false);
      return;
    }
    fetchLikedSongs().then((songs) => {
      setLikedIds(new Set(songs.map((s) => s.id)));
      setInitialised(true);
    });
  }, [isAuthenticated]);

  /** Returns true if songId is in the liked set */
  const isLiked = useCallback(
    (songId) => likedIds.has(songId),
    [likedIds]
  );

  /**
   * Optimistically toggle like for a song.
   * Returns the new liked state (boolean).
   */
  const toggleLike = useCallback(async (songId) => {
    const wasLiked = likedIds.has(songId);
    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(songId);
      else next.add(songId);
      return next;
    });
    try {
      const result = await apiToggleLike(songId);
      // Sync with authoritative server state
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(songId);
        else next.delete(songId);
        return next;
      });
      return result.liked;
    } catch {
      // Roll back on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(songId);
        else next.delete(songId);
        return next;
      });
      return wasLiked;
    }
  }, [likedIds]);

  /**
   * Refresh liked songs from server (call after bulk operations).
   */
  const refreshLikedSongs = useCallback(async () => {
    if (!isAuthenticated) return;
    const songs = await fetchLikedSongs();
    setLikedIds(new Set(songs.map((s) => s.id)));
  }, [isAuthenticated]);

  return (
    <LikeContext.Provider value={{ likedIds, isLiked, toggleLike, refreshLikedSongs, initialised }}>
      {children}
    </LikeContext.Provider>
  );
}

export function useLike() {
  const ctx = useContext(LikeContext);
  if (!ctx) throw new Error("useLike must be used within LikeProvider");
  return ctx;
}