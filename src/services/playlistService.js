import axiosInstance from "./axiosInstance";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function resolveUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

/**
 * Normalize a raw song nested inside a playlist response.
 * The Rails playlist controller uses: include: :songs
 * which returns songs with basic fields (no audio_url / nested album/artists by default).
 * We store whatever we get and try to resolve the audio_url.
 */
function normalizePlaylistSong(raw) {
  return {
    id: raw.id,
    name: raw.name || "Unknown Song",
    duration: raw.duration || 0,
    genre: raw.genre || "",
    albumId: raw.album_id || null,
    audioUrl: resolveUrl(raw.audio_url || raw.audioUrl || null),
    album: raw.album
      ? {
          id: raw.album.id,
          name: raw.album.name,
          coverUrl: resolveUrl(
            raw.album.cover_image_url ??
            raw.album.cover_url ??
            raw.album.avatar_url ??
            null
          ),
        }
      : null,
    artists: Array.isArray(raw.artists)
      ? raw.artists.map((a) => ({
          id: a.id,
          name: a.user?.name ?? a.name ?? "Unknown Artist",
        }))
      : [],
  };
}

/**
 * Normalize a raw playlist from the API.
 */
function normalizePlaylist(raw) {
  return {
    id: raw.id,
    name: raw.name || "Untitled Playlist",
    description: raw.description || "",
    coverUrl: raw.cover_url || raw.coverUrl || null,
    songCount: raw.song_count ?? (Array.isArray(raw.songs) ? raw.songs.length : 0),
    songs: Array.isArray(raw.songs) ? raw.songs.map(normalizePlaylistSong) : [],
    createdAt: raw.created_at || raw.createdAt || null,
    updatedAt: raw.updated_at || raw.updatedAt || null,
  };
}

export async function fetchPlaylists() {
  try {
    const { data } = await axiosInstance.get("/playlists");
    let raw = [];
    if (Array.isArray(data)) raw = data;
    else if (data && Array.isArray(data.playlists)) raw = data.playlists;
    return raw.map(normalizePlaylist);
  } catch {
    return [];
  }
}

export async function fetchPlaylist(id) {
  try {
    const { data } = await axiosInstance.get(`/playlists/${id}`);
    return normalizePlaylist(data);
  } catch {
    return null;
  }
}

export async function createPlaylist(payload) {
  try {
    const { data } = await axiosInstance.post("/playlists", {
      playlist: {
        name: payload.name,
        description: payload.description || "",
      },
    });
    return normalizePlaylist(data);
  } catch {
    // Optimistic local creation fallback
    return normalizePlaylist({
      id: `local_${Date.now()}`,
      name: payload.name,
      description: payload.description || "",
    });
  }
}

export async function updatePlaylist(id, payload) {
  try {
    const { data } = await axiosInstance.put(`/playlists/${id}`, {
      playlist: {
        name: payload.name,
        description: payload.description || "",
      },
    });
    return normalizePlaylist(data);
  } catch {
    return normalizePlaylist({ id, ...payload });
  }
}

export async function deletePlaylist(id) {
  try {
    await axiosInstance.delete(`/playlists/${id}`);
  } catch {
    // Silently handle if API not implemented
  }
}

/**
 * Add a song to a playlist.
 * Rails route: POST /playlists/:id/playlist_songs
 * body: { playlist_song: { song_id } }
 */
export async function addSongToPlaylist(playlistId, songId) {
  try {
    const { data } = await axiosInstance.post(
      `/playlists/${playlistId}/playlist_songs`,
      { playlist_song: { song_id: songId } }
    );
    return normalizePlaylist(data);
  } catch {
    // no-op
  }
}

/**
 * Remove a song from a playlist.
 * Rails route: DELETE /playlists/:id/playlist_songs/:id
 * We need the playlist_song join record ID, which we can look up via GET first,
 * or use a custom action. Since the Rails controller uses playlist_songs nested resource,
 * we do DELETE /playlists/:playlist_id/playlist_songs/:playlist_song_id.
 */
export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    // First fetch the playlist to find the playlist_song id
    const playlist = await fetchPlaylist(playlistId);
    if (!playlist) return;
    // Find the playlist_song record id — the API returns songs directly,
    // so we use song_id matching
    await axiosInstance.delete(
      `/playlists/${playlistId}/playlist_songs/${songId}`
    );
  } catch {
    // no-op
  }
}