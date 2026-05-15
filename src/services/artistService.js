import axiosInstance from "./axiosInstance";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Resolve a potentially relative avatar path to a full URL.
 * The Rails backend returns only_path: true paths like /rails/active_storage/blobs/...
 */
function resolveAvatarUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

/**
 * Normalize a raw artist object from the API into a flat shape.
 *
 * The backend returns:
 *   {
 *     id, bio, dob,
 *     user: { id, name, email, role, dob, avatar },
 *     created_at, updated_at
 *   }
 *
 * We flatten it to:
 *   { id, name, bio, dob, email, avatarUrl }
 *
 * @param {object} raw
 * @returns {{ id: number, name: string, bio: string|null, dob: string|null, email: string, avatarUrl: string|null }}
 */
function normalizeArtist(raw) {
  const rawAvatar = raw.user?.avatar ?? raw.avatar_url ?? raw.avatarUrl ?? raw.image_url ?? null;
  return {
    id: raw.id,
    name: raw.user?.name ?? raw.name ?? "",
    bio: raw.bio ?? null,
    dob: raw.dob ?? raw.user?.dob ?? null,
    email: raw.user?.email ?? raw.email ?? "",
    avatarUrl: resolveAvatarUrl(rawAvatar),
  };
}

/**
 * Fetch all artists from the API.
 *
 * The backend may return either:
 *   - An empty array `[]` when there are no artists, OR
 *   - `{ artists: [...], count: N }` when artists exist.
 *
 * This function always resolves to a plain array of normalized artist objects.
 *
 * @returns {Promise<Array<{ id: number, name: string, bio: string|null, email: string }>>}
 */
export async function fetchArtists() {
  const { data } = await axiosInstance.get("/artists");

  // Handle both response shapes
  let raw = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if (data && Array.isArray(data.artists)) {
    raw = data.artists;
  }
  return raw.map(normalizeArtist);
}

/**
 * Build a FormData or plain-object body for artist create/update.
 * When avatarFile is provided the request is multipart/form-data so the
 * server can persist the image. Otherwise JSON is used.
 */
function buildArtistBody(payload) {
  if (payload.avatarFile) {
    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("email", payload.email);
    if (payload.dob) fd.append("dob", payload.dob);
    if (payload.bio) fd.append("bio", payload.bio);
    fd.append("avatar", payload.avatarFile, payload.avatarFile.name);
    return fd;
  }
  return {
    name: payload.name,
    email: payload.email,
    dob: payload.dob || null,
    bio: payload.bio || null,
  };
}

/**
 * Create a new artist.
 *
 * @param {{ name: string, email: string, bio?: string, avatarFile?: File|null }} payload
 * @returns {Promise<{ id: number, name: string, bio: string|null, email: string, avatarUrl: string|null }>}
 */
export async function createArtist(payload) {
  const body = buildArtistBody(payload);
  const config = body instanceof FormData
    ? { headers: { "Content-Type": undefined } }
    : {};
  const { data } = await axiosInstance.post("/artists", body, config);
  return normalizeArtist(data);
}

/**
 * Update an existing artist.
 *
 * @param {number} id
 * @param {{ name: string, email: string, bio?: string, avatarFile?: File|null }} payload
 * @returns {Promise<{ id: number, name: string, bio: string|null, email: string, avatarUrl: string|null }>}
 */
export async function updateArtist(id, payload) {
  const body = buildArtistBody(payload);
  const config = body instanceof FormData
    ? { headers: { "Content-Type": undefined } }
    : {};
  const { data } = await axiosInstance.put(`/artists/${id}`, body, config);
  return normalizeArtist(data);
}

/**
 * Delete an artist.
 *
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteArtist(id) {
  await axiosInstance.delete(`/artists/${id}`);
}
