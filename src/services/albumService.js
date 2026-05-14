import axiosInstance from "./axiosInstance";

/**
 * Normalize a raw album object from the API into a flat shape.
 *
 * @param {object} raw
 * @returns {{ id: number, name: string, releasedDate: string, description: string, musicDirectorId: number, musicDirectorName?: string }}
 */
function normalizeAlbum(raw) {
  return {
    id: raw.id,
    name: raw.name,
    releasedDate: raw.released_date || raw.release_date || raw.releasedDate || "",
    description: raw.description || raw.bio || "",
    musicDirectorId: raw.artist_id || raw.music_director_id || raw.musicDirectorId,
    musicDirectorName: raw.artist?.name || raw.music_director?.name || "",
    avatarUrl: raw.avatar_url ?? raw.avatarUrl ?? raw.image_url ?? raw.cover_url ?? null,
  };
}

/**
 * Build FormData or plain-object body for album create/update.
 */
function buildAlbumBody(payload) {
  if (payload.avatarFile) {
    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("released_date", payload.releasedDate);
    if (payload.description) fd.append("description", payload.description);
    fd.append("artist_id", payload.musicDirectorId);
    fd.append("cover", payload.avatarFile, payload.avatarFile.name);
    return fd;
  }
  return {
    name: payload.name,
    released_date: payload.releasedDate,
    description: payload.description,
    artist_id: payload.musicDirectorId,
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
  const { data } = await axiosInstance.post("/albums", body);
  return normalizeAlbum(data);
}

export async function updateAlbum(id, payload) {
  const body = buildAlbumBody(payload);
  const { data } = await axiosInstance.put(`/albums/${id}`, body);
  return normalizeAlbum(data);
}

export async function deleteAlbum(id) {
  await axiosInstance.delete(`/albums/${id}`);
}
