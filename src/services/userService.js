import axiosInstance from "./axiosInstance";

/**
 * userService — all authenticated user-profile API calls.
 * Uses axiosInstance (with Bearer token + silent-refresh interceptors).
 *
 * Backend routes (from config/routes.rb):
 *   GET   /profile  → users#profile
 *   PATCH /profile  → users#update  (dispatches on params[:type])
 *
 * PATCH /profile with type="info"     → { type, name?, email?, dob? }
 * PATCH /profile with type="password" → { type, current_password, new_password, password_confirmation }
 * PATCH /profile with type="avatar"   → multipart/form-data { type, avatar: File }
 *
 * Success response shape (user_profile_json):
 *   { id, name, email, dob, role, avatar_url }
 */

/**
 * Normalise the user object returned by the API so callers always get
 * camelCase keys regardless of what the backend returns.
 */
function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id:        raw.id        ?? null,
    name:      raw.name      ?? null,
    email:     raw.email     ?? null,
    role:      raw.role      ?? "listener",
    dob:       raw.dob       ?? raw.date_of_birth ?? null,
    avatarUrl: raw.avatarUrl ?? raw.avatar_url    ?? null,
  };
}

export const userService = {
  /**
   * Fetch the current user's full profile (includes dob and avatar_url).
   * GET /profile
   *
   * @returns {Object} — normalised user object { id, name, email, role, dob, avatarUrl }
   */
  async getProfile() {
    const response = await axiosInstance.get("/profile");
    return normalizeUser(response.data);
  },

  /**
   * Update profile fields (name, email, dob).
   * Only sends fields that have actually changed — caller is responsible
   * for diffing against the current user state before calling.
   * PATCH /profile  with type="info"
   *
   * @param {Object} fields  — e.g. { name: "Alice", email: "a@b.com", dob: "1990-01-01" }
   * @returns {Object}       — normalised user object
   */
  async updateProfile(fields) {
    const response = await axiosInstance.patch("/profile", {
      type: "info",
      ...fields,
    });
    return normalizeUser(response.data);
  },

  /**
   * Change password.
   * PATCH /profile  with type="password"
   *
   * @param {string} currentPassword
   * @param {string} newPassword
   * @param {string} passwordConfirmation  — must match newPassword
   * @returns {Object} — normalised user object
   */
  async updatePassword(currentPassword, newPassword, passwordConfirmation) {
    const response = await axiosInstance.patch("/profile", {
      type:                  "password",
      current_password:      currentPassword,
      new_password:          newPassword,
      password_confirmation: passwordConfirmation,
    });
    return normalizeUser(response.data);
  },

  /**
   * Upload a new avatar image.
   * PATCH /profile  with type="avatar"
   * Sends multipart/form-data so the Content-Type header is set automatically
   * by the browser (including the correct boundary).
   *
   * @param {File} file  — image file selected by the user
   * @param {Function} [onProgress]  — optional (percent: number) => void
   * @returns {Object} — normalised user object
   */
  async uploadAvatar(file, onProgress) {
    const form = new FormData();
    form.append("type", "avatar");
    form.append("avatar", file);

    const response = await axiosInstance.patch("/profile", form, {
      // Do NOT set Content-Type — let the browser set it with the correct boundary
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (evt) => {
            if (evt.total) {
              onProgress(Math.round((evt.loaded * 100) / evt.total));
            }
          }
        : undefined,
    });

    return normalizeUser(response.data);
  },
};