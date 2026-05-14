import axiosInstance from "./axiosInstance";

/**
 * Normalize a raw artist object from the API into a flat shape.
 *
 * The backend returns:
 *   {
 *     id, bio,
 *     user: { id, name, email, role, avatar },
 *     created_at, updated_at
 *   }
 *
 * We flatten it to:
 *   { id, name, bio, email, avatarUrl }
 *
 * @param {object} raw
 * @returns {{ id: number, name: string, bio: string|null, email: string, avatarUrl: string|null }}
 */
function normalizeArtist(raw) {
  return {
    id: raw.id,
    name: raw.user?.name ?? raw.name ?? "",
    bio: raw.bio ?? null,
    email: raw.user?.email ?? raw.email ?? "",
    avatarUrl: raw.user?.avatar ?? raw.avatar_url ?? raw.avatarUrl ?? raw.image_url ?? null,
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
    if (payload.bio) fd.append("bio", payload.bio);
    fd.append("avatar", payload.avatarFile, payload.avatarFile.name);
    return fd;
  }
  return { name: payload.name, email: payload.email, bio: payload.bio || null };
}

/**
 * Create a new artist.
 *
 * @param {{ name: string, email: string, bio?: string, avatarFile?: File|null }} payload
 * @returns {Promise<{ id: number, name: string, bio: string|null, email: string, avatarUrl: string|null }>}
 */
export async function createArtist(payload) {
  const body = buildArtistBody(payload);
  const { data } = await axiosInstance.post("/artists", body);
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
  const { data } = await axiosInstance.put(`/artists/${id}`, body);
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
