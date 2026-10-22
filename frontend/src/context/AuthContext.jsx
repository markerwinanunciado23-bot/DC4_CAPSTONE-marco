import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blueway_user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((token, account) => {
    localStorage.setItem("blueway_token", token);
    localStorage.setItem("blueway_user", JSON.stringify(account));
    setUser(account);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("blueway_token");
    localStorage.removeItem("blueway_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("blueway_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/user");
      const account = response.data.user;

      localStorage.setItem("blueway_user", JSON.stringify(account));
      setUser(account);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function login(credentials) {
    const response = await api.post("/login", credentials);
    saveSession(response.data.token, response.data.user);
    return response.data;
  }

  async function register(details) {
    const response = await api.post("/register", details);
    saveSession(response.data.token, response.data.user);
    return response.data;
  }

  async function logout() {
    try {
      if (localStorage.getItem("blueway_token")) {
        await api.post("/logout");
      }
    } finally {
      clearSession();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}