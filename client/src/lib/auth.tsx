import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiRequest, queryClient } from "./queryClient";
import { setAuthToken } from "./token";

type User = {
  id: string;
  email: string;
  mustChangePassword: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/login", { email, password });
    const data = await res.json();
    // Store token in memory (cookies/localStorage unavailable in iframe)
    setAuthToken(data.token);
    const { token: _, ...userData } = data;
    setUser(userData as User);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/logout");
    } catch {
      // ignore logout errors
    }
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiRequest("PATCH", "/api/me/password", { currentPassword, newPassword });
    // Update local user state to reflect password changed
    setUser((prev) => prev ? { ...prev, mustChangePassword: false } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
