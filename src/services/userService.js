import axiosInstance from "./axiosInstance";

/**
 * userService — all authenticated user-profile API calls.
 * Uses axiosInstance (with Bearer token + silent-refresh interceptors).
 *
 * Endpoint: PATCH /api/users/edit
 *   Profile update payload : { name?, email?, dob? }
 *   Password update payload : { currentPassword, newPassword }
 *   Avatar upload           : multipart/form-data  { avatar: File }
 *
 * Success response shape:
 *   { success: true, message: string, data: { updatedUser: {...} } }
 *
 * Error response shape:
 *   { success: false, message: string, errors?: [...] }
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
   * Update profile fields (name, email, dob).
   * Only sends fields that have actually changed — caller is responsible
   * for diffing against the current user state before calling.
   *
   * @param {Object} fields  — e.g. { name: "Alice", email: "a@b.com" }
   * @returns {Object}       — { updatedUser }
   */
  async updateProfile(fields) {
    const response = await axiosInstance.patch("/api/users/edit", fields);
    const data = response.data?.data ?? response.data;
    return { updatedUser: normalizeUser(data?.updatedUser ?? data) };
  },

  /**
   * Change password.
   *
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Object} — { message }
   */
  async updatePassword(currentPassword, newPassword) {
    const response = await axiosInstance.patch("/api/users/edit", {
      currentPassword,
      newPassword,
    });
    return { message: response.data?.message ?? "Password updated." };
  },

  /**
   * Upload a new avatar image.
   * Sends multipart/form-data so the Content-Type header is set automatically
   * by the browser (including the correct boundary).
   *
   * @param {File} file  — image file selected by the user
   * @param {Function} [onProgress]  — optional (percent: number) => void
   * @returns {Object} — { updatedUser }
   */
  async uploadAvatar(file, onProgress) {
    const form = new FormData();
    form.append("avatar", file);

    const response = await axiosInstance.patch("/api/users/edit", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (evt) => {
            if (evt.total) {
              onProgress(Math.round((evt.loaded * 100) / evt.total));
            }
          }
        : undefined,
    });

    const data = response.data?.data ?? response.data;
    return { updatedUser: normalizeUser(data?.updatedUser ?? data) };
  },

  /**
   * Remove / reset avatar back to the initials-based default.
   * Sends a null avatarUrl signal to the backend.
   *
   * @returns {Object} — { updatedUser }
   */
  async removeAvatar() {
    const response = await axiosInstance.patch("/api/users/edit", {
      avatarUrl: null,
    });
    const data = response.data?.data ?? response.data;
    return { updatedUser: normalizeUser(data?.updatedUser ?? data) };
  },
};