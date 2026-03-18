import axios from "axios";

let accessToken = localStorage.getItem("accessToken"); // persist across reloads

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post(
          "http://localhost:3000/refresh",
          {},
          { withCredentials: true }
        );
        accessToken = data.access_token;
        localStorage.setItem("accessToken", accessToken); // persist new token
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config); // retry
      } catch {
        localStorage.removeItem("accessToken");
        accessToken = null;
      }
    }
    return Promise.reject(error);
  }
);

export const setAccessToken = (token) => {
  accessToken = token;
  localStorage.setItem("accessToken", token);
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("accessToken");
};

export default api;
