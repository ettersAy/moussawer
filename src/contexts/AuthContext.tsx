import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, clearToken, setToken, type User } from "../lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; role: "CLIENT" | "PHOTOGRAPHER"; location?: string; bio?: string }) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await api<User | null>("/me");
      setUser(response.data ?? null);
    } catch {
      // Server/network error — keep existing auth state, don't invalidate token
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false
    });
    setToken(response.data.token);
    setUser(response.data.user);
  }, []);

  const register = useCallback(async (input: { name: string; email: string; password: string; role: "CLIENT" | "PHOTOGRAPHER"; location?: string; bio?: string }) => {
    const response = await api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: input,
      auth: false
    });
    setToken(response.data.token);
    setUser(response.data.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const response = await api<{ token: string; user: User }>("/auth/google", {
      method: "POST",
      body: { credential },
      auth: false
    });
    setToken(response.data.token);
    setUser(response.data.user);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, googleLogin, logout, refresh }), [user, loading, login, register, googleLogin, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
