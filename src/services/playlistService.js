import axiosInstance from "./axiosInstance";

/**
 * Normalize a raw playlist from the API.
 */
function normalizePlaylist(raw) {
  return {
    id: raw.id,
    name: raw.name || "Untitled Playlist",
    description: raw.description || "",
    coverUrl: raw.cover_url || raw.coverUrl || null,
    songCount: raw.song_count ?? raw.songs?.length ?? 0,
    songs: Array.isArray(raw.songs) ? raw.songs : [],
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
    // Return empty array if playlists API not yet implemented
    return [];
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

export async function addSongToPlaylist(playlistId, songId) {
  try {
    await axiosInstance.post(`/playlists/${playlistId}/songs`, { song_id: songId });
  } catch {
    // no-op
  }
}

export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
  } catch {
    // no-op
  }
}