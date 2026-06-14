import React, { createContext, useState, useEffect } from "react";
import { socket, connectSocket } from "../api/socket";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Socket connection setup — use local user state, not useAuth hook (which causes circular dependency)
  useEffect(() => {
    if (!user) return;

    // Ensure socket is connected with current token
    connectSocket(localStorage.getItem("token"));

    socket.on("connect", () => {
      socket.emit("join", user._id);
      console.log("⚡ Joined socket room:", user._id);
    });

    return () => {
      socket.off("connect");
    };
  }, [user]);

  // Helper: normalizes profileImage to { url, public_id } or null
  const normalizeProfileImage = (img) => {
    if (!img) return null;
    if (typeof img === "string") return { url: img, public_id: null };
    if (typeof img === "object" && img.url) return img;
    return null;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({
        ...parsed,
        profileImage: normalizeProfileImage(parsed.profileImage),
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      profileImage: normalizeProfileImage(userData.profileImage),
    };
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
