import axiosInstance from "./axiosInstance";

/**
 * Normalize a raw artist object from the API into a flat shape.
 *
 * The backend returns:
 *   {
 *     id, name, bio,
 *     user: { id, email, role },
 *     created_at, updated_at
 *   }
 *
 * We flatten it to:
 *   { id, name, bio, email }
 *
 * @param {object} raw
 * @returns {{ id: number, name: string, bio: string|null, email: string }}
 */
function normalizeArtist(raw) {
  return {
    id: raw.id,
    name: raw.name,
    bio: raw.bio ?? null,
    email: raw.user?.email ?? raw.email ?? "",
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
 * Create a new artist.
 *
 * @param {{ name: string, email: string, bio?: string }} payload
 * @returns {Promise<{ id: number, name: string, bio: string|null, email: string }>}
 */
export async function createArtist(payload) {
  const { data } = await axiosInstance.post("/artists", {
    name: payload.name,
    email: payload.email,
    bio: payload.bio || null,
  });
  return normalizeArtist(data);
}