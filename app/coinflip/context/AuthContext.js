import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import api from "../utils/api";
import { connectSocket } from "../utils/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ Combined useEffect for initialization
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");

        if (token) {
          setUserToken(token);
          setUserRole(role || null);

          try {
            const res = await api.get("/user/profile");
            setUser(res.data);
          } catch (profileErr) {
            console.log("Profile fetch failed:", profileErr.message);
            await AsyncStorage.removeItem("token");
            setUserToken(null);
            setUserRole(null);
          }

          await connectSocket(); // only if token exists
        }
      } catch (e) {
        console.error("Init auth error:", e.message);
      } finally {
        setLoading(false); // ✅ only one final loading control
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      const role = res.data.user?.role || res.data.role || null;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role);

      setUserToken(token);
      setUserRole(role);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email, password) => {
    const res = await api.post("/auth/register", { email, password });

    const token = res.data.token;
    const role = res.data.user?.role || null;

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role);

    setUserToken(token);
    setUserRole(role);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role"]);
    setUserToken(null);
    setUserRole(null);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.put("/user/profile", updates);
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Update profile failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const updateAvatar = async (avatarUrl) => {
    try {
      const res = await api.put("/user/avatar", { avatar: avatarUrl });
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Update avatar failed:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userRole,
        login,
        register,
        logout,
        user,
        updateProfile,
        updateAvatar,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
