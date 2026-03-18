import axios from "axios";

let accessToken = null;

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // allows cookies
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
      const { data } = await axios.post(
        "http://localhost:3000/refresh",
        {},
        { withCredentials: true }
      );
      accessToken = data.access_token;
      error.config.headers.Authorization = `Bearer ${accessToken}`;
      return api(error.config); // retry original request
    }
    return Promise.reject(error);
  }
);

export const setAccessToken = (token) => {
  accessToken = token;
};

export default api;
