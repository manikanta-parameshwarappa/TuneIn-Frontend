import axiosInstance from "./axiosInstance";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function resolveUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

/**
 * Normalize a raw artist object as returned inside a song response.
 * Rails returns: { id, bio, user: { id, name, email, ... } }
 */
function normalizeEmbeddedArtist(raw) {
  return {
    id: raw.id,
    name: raw.user?.name ?? raw.name ?? "Unknown Artist",
  };
}

/**
 * Normalize a raw song object from the API.
 * Handles the Rails response shape:
 *   { id, name, duration, genre, album_id, audio_url,
 *     album: { id, name, cover_image_url, ... },
 *     artists: [{ id, bio, user: { name, ... } }, ...] }
 */
function normalizeSong(raw) {
  const artists = Array.isArray(raw.artists)
    ? raw.artists.map(normalizeEmbeddedArtist)
    : [];

  const album = raw.album || null;
  const albumCoverUrl = resolveUrl(
    album?.cover_image_url ?? album?.avatarUrl ?? album?.image_url ?? null
  );

  return {
    id: raw.id,
    name: raw.name,
    albumId: raw.album_id || raw.albumId || album?.id || "",
    duration: raw.duration,
    genre: raw.genre || "",
    artistIds: artists.map((a) => a.id),
    artists,
    album: album
      ? { id: album.id, name: album.name, coverUrl: albumCoverUrl }
      : null,
    audioUrl: resolveUrl(raw.audio_url || raw.audioUrl || null),
  };
}

export async function fetchSongs() {
  const { data } = await axiosInstance.get("/songs");
  let raw = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if (data && Array.isArray(data.songs)) {
    raw = data.songs;
  } else if (data && Array.isArray(data.data)) {
    raw = data.data;
  }
  return raw.map(normalizeSong);
}

/**
 * Upload multiple songs via bulk_create.
 * Expected payload: Array of objects { file, name, albumId, duration, genre, artistIds }
 */
export async function uploadSongs(songs, onProgress) {
  const formData = new FormData();

  songs.forEach((song, index) => {
    formData.append(`songs[${index}][file]`, song.file);
    formData.append(`songs[${index}][name]`, song.name);
    formData.append(`songs[${index}][album_id]`, song.albumId);
    if (song.duration) formData.append(`songs[${index}][duration]`, song.duration);
    if (song.genre) formData.append(`songs[${index}][genre]`, song.genre);

    if (song.artistIds && song.artistIds.length > 0) {
      song.artistIds.forEach((id) => {
        formData.append(`songs[${index}][artist_ids][]`, id);
      });
    }
  });

  const { data } = await axiosInstance.post("/songs/bulk_create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
  });

  let raw = [];
  if (Array.isArray(data)) raw = data;
  else if (data && Array.isArray(data.songs)) raw = data.songs;

  return raw.map(normalizeSong);
}

/**
 * Update song metadata.
 * The Rails backend uses:
 *   params.require(:song).permit(:name, :duration, :genre)
 *   params[:album_id]   → passed outside :song wrapper
 *   params[:artist_ids] → passed outside :song wrapper
 */
export async function updateSong(id, payload) {
  const { data } = await axiosInstance.put(`/songs/${id}`, {
    song: {
      name: payload.name,
      duration: payload.duration || null,
      genre: payload.genre || null,
    },
    album_id: payload.albumId || null,
    artist_ids: payload.artistIds || [],
  });
  return normalizeSong(data);
}

/**
 * Delete a song by id.
 */
export async function deleteSong(id) {
  await axiosInstance.delete(`/songs/${id}`);
}
