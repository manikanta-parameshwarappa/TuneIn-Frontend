import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

/**
 * axiosInstance — the main HTTP client used for all authenticated requests.
 * Interceptors are attached in setupAxiosInterceptors() which is called once
 * from AuthProvider after context is ready.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends HttpOnly refresh-token cookie automatically
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * A separate, plain axios instance used exclusively for the /refresh call
 * to avoid infinite retry loops (since it has no interceptors).
 */
export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach request + response interceptors to axiosInstance.
 * Call this once from AuthProvider, passing the context helpers.
 *
 * @param {() => string | null} getAccessToken  — getter returning current in-memory token
 * @param {() => Promise<string>} doRefresh     — calls /refresh, updates state, returns new token
 * @param {() => void} onRefreshFail            — called when refresh itself fails (force logout)
 */
export function setupAxiosInterceptors(getAccessToken, doRefresh, onRefreshFail) {
  // --- REQUEST interceptor: attach Bearer token to every request ---
  const reqInterceptor = axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- RESPONSE interceptor: on 401, silently refresh and retry once ---
  const resInterceptor = axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only attempt refresh once per request (_retry flag prevents loops)
      if (
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await doRefresh();
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          onRefreshFail();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Return eject functions so interceptors can be cleaned up if needed
  return () => {
    axiosInstance.interceptors.request.eject(reqInterceptor);
    axiosInstance.interceptors.response.eject(resInterceptor);
  };
}

export default axiosInstance;