import axiosInstance from "./axiosInstance";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Resolve a potentially relative cover image path to a full URL.
 * The Rails backend returns only_path: true paths like /rails/active_storage/blobs/...
 */
function resolveCoverUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

/**
 * Normalize a raw album object from the API into a flat shape.
 *
 * The backend now returns:
 *   { id, name, released_date, description, artist_id, cover_image_url,
 *     artist: { id, name, email }, created_at, updated_at }
 *
 * @param {object} raw
 * @returns {{ id: number, name: string, releasedDate: string, description: string, musicDirectorId: number, musicDirectorName: string, avatarUrl: string|null }}
 */
function normalizeAlbum(raw) {
  return {
    id: raw.id,
    name: raw.name,
    releasedDate: raw.released_date || raw.release_date || raw.releasedDate || "",
    description: raw.description || raw.bio || "",
    musicDirectorId: raw.artist_id || raw.music_director_id || raw.musicDirectorId,
    musicDirectorName:
      raw.artist?.name ||
      raw.music_director?.name ||
      raw.musicDirectorName ||
      "",
    avatarUrl: resolveCoverUrl(
      raw.cover_image_url ?? raw.avatar_url ?? raw.avatarUrl ?? raw.image_url ?? raw.cover_url ?? null
    ),
  };
}

/**
 * Build FormData or plain-object body for album create/update.
 * The backend ActiveStorage attachment is named :cover_image, so FormData
 * must use the key "album[cover_image]" (wrapped param) or rely on Rails
 * unwrapping — we send it as "album[cover_image]" to match album_params.
 */
function buildAlbumBody(payload) {
  if (payload.avatarFile) {
    const fd = new FormData();
    fd.append("album[name]", payload.name);
    fd.append("album[released_date]", payload.releasedDate);
    if (payload.description) fd.append("album[description]", payload.description);
    fd.append("album[artist_id]", payload.musicDirectorId);
    fd.append("album[cover_image]", payload.avatarFile, payload.avatarFile.name);
    return fd;
  }
  return {
    album: {
      name: payload.name,
      released_date: payload.releasedDate,
      description: payload.description,
      artist_id: payload.musicDirectorId,
    },
  };
}

export async function fetchAlbums() {
  const { data } = await axiosInstance.get("/albums");
  
  let raw = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if (data && Array.isArray(data.albums)) {
    raw = data.albums;
  } else if (data && Array.isArray(data.data)) {
    raw = data.data;
  }
  return raw.map(normalizeAlbum);
}

export async function createAlbum(payload) {
  const body = buildAlbumBody(payload);
  const config = body instanceof FormData
    ? { headers: { "Content-Type": undefined } }
    : {};
  const { data } = await axiosInstance.post("/albums", body, config);
  return normalizeAlbum(data);
}

export async function updateAlbum(id, payload) {
  const body = buildAlbumBody(payload);
  const config = body instanceof FormData
    ? { headers: { "Content-Type": undefined } }
    : {};
  const { data } = await axiosInstance.put(`/albums/${id}`, body, config);
  return normalizeAlbum(data);
}

export async function deleteAlbum(id) {
  await axiosInstance.delete(`/albums/${id}`);
}
