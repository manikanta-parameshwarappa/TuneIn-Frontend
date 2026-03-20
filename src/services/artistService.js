import axiosInstance from "./axiosInstance";

/**
 * Fetch all artists from the API.
 *
 * The backend may return either:
 *   - An empty array `[]` when there are no artists, OR
 *   - `{ artists: [...], count: N }` when artists exist.
 *
 * This function always resolves to a plain array of artist objects.
 *
 * @returns {Promise<Array<{ id: number, name: string, bio: string|null, email: string }>>}
 */
export async function fetchArtists() {
  const { data } = await axiosInstance.get("/artists");

  // Handle both response shapes
  if (Array.isArray(data)) {
    return data; // empty []
  }
  if (data && Array.isArray(data.artists)) {
    return data.artists;
  }
  return [];
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
  return data;
}