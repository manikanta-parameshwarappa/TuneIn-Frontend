import { createContext, useState, useEffect } from "react";
import { loginApi, signupApi, logoutApi } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (data) => {
    const res = await loginApi(data);
    setUser(res.user);
  };

  const signup = async (data) => {
    const res = await signupApi(data);
    setUser(res.user);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};