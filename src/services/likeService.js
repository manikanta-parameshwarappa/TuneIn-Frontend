import axiosInstance from "./axiosInstance";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function resolveUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

function normalizeEmbeddedArtist(raw) {
  return {
    id: raw.id,
    name: raw.user?.name ?? raw.name ?? "Unknown Artist",
  };
}

function normalizeSong(raw) {
  const artists = Array.isArray(raw.artists) ? raw.artists.map(normalizeEmbeddedArtist) : [];
  const album = raw.album || null;
  const albumCoverUrl = resolveUrl(
    album?.cover_image_url ?? album?.cover_url ?? album?.avatar_url ?? null
  );
  const audioUrl = resolveUrl(
    raw.audio_url ?? raw.audioUrl ?? raw.file_url ?? null
  );
  return {
    id: raw.id,
    name: raw.name,
    albumId: raw.album_id || raw.albumId || album?.id || "",
    duration: raw.duration,
    genre: raw.genre || "",
    artistIds: artists.map((a) => a.id),
    artists,
    album: album ? { id: album.id, name: album.name, coverUrl: albumCoverUrl } : null,
    audioUrl,
    liked: raw.liked ?? false,
  };
}

/**
 * Toggle like for a song.
 * POST /songs/:songId/likes
 * Returns { liked: boolean, song_id: number, likes_count: number }
 */
export async function toggleLike(songId) {
  const { data } = await axiosInstance.post(`/songs/${songId}/likes`);
  return {
    liked: data.liked,
    songId: data.song_id,
    likesCount: data.likes_count,
  };
}

/**
 * Check if current user liked a song.
 * GET /songs/:songId/likes
 * Returns { liked: boolean, song_id: number, likes_count: number }
 */
export async function checkLike(songId) {
  try {
    const { data } = await axiosInstance.get(`/songs/${songId}/likes`);
    return {
      liked: data.liked,
      songId: data.song_id,
      likesCount: data.likes_count,
    };
  } catch {
    return { liked: false, songId, likesCount: 0 };
  }
}

/**
 * Fetch all liked songs for the current user.
 * GET /liked_songs
 * Returns normalized song array.
 */
export async function fetchLikedSongs() {
  try {
    const { data } = await axiosInstance.get("/liked_songs");
    let raw = [];
    if (Array.isArray(data)) raw = data;
    else if (data && Array.isArray(data.songs)) raw = data.songs;
    return raw.map(normalizeSong);
  } catch {
    return [];
  }
}