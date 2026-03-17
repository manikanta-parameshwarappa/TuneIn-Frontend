import api, { setAccessToken } from "./axios";

export const signupApi = async (data) => {
  const res = await api.post("/signup", data);
  setAccessToken(res.data.access_token);
  return res.data;
};

export const loginApi = async (data) => {
  const res = await api.post("/login", data);
  setAccessToken(res.data.access_token);
  return res.data;
};

export const logoutApi = async () => {
  await api.delete("/logout");
  setAccessToken(null);
};