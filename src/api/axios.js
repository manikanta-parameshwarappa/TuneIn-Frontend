import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true // 🔥 important for cookies
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Request interceptor
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor (AUTO REFRESH 🔥)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "http://localhost:3000/refresh",
          {},
          { withCredentials: true }
        );

        setAccessToken(res.data.access_token);

        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;

        return api(originalRequest);
      } catch (error) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;