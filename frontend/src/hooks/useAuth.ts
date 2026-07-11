import { useCallback, useEffect, useState } from "react";
import { adminLogin, adminLogout } from "../lib/api";
import type { AdminUser } from "../types";

const TEN_HOURS_SECONDS = 10 * 3600; // 36000 seconds = 10 hours
const TEN_HOURS_MS = TEN_HOURS_SECONDS * 1000;

let inMemoryToken: string | null = null;
let inMemoryUser: AdminUser | null = null;

function setSessionStorage(token: string, user: AdminUser | null) {
  if (typeof window === "undefined") return;

  document.cookie = `access_token=${encodeURIComponent(
    token
  )}; path=/; max-age=${TEN_HOURS_SECONDS}; samesite=Lax`;

  const expiresAt = Date.now() + TEN_HOURS_MS;
  localStorage.setItem("access_token", token);
  localStorage.setItem("session_expires_at", String(expiresAt));
  if (user) {
    localStorage.setItem("admin_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("admin_user");
  }
}

function clearSessionStorage() {
  if (typeof window === "undefined") return;

  document.cookie =
    "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax";
  localStorage.removeItem("access_token");
  localStorage.removeItem("session_expires_at");
  localStorage.removeItem("admin_user");
}

function getTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getStoredSession(): { token: string | null; user: AdminUser | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const expiresAtRaw = localStorage.getItem("session_expires_at");
  if (expiresAtRaw) {
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) {
      clearSessionStorage();
      return { token: null, user: null };
    }
  }

  const token = localStorage.getItem("access_token") || getTokenCookie();
  let user: AdminUser | null = null;
  const userRaw = localStorage.getItem("admin_user");
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return { token, user };
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (inMemoryUser) return inMemoryUser;
    const session = getStoredSession();
    if (session.user) inMemoryUser = session.user;
    return session.user;
  });

  const [tokenState, setTokenState] = useState<string | null>(() => {
    if (inMemoryToken) return inMemoryToken;
    const session = getStoredSession();
    if (session.token) inMemoryToken = session.token;
    return session.token;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (inMemoryToken) return true;
    const session = getStoredSession();
    return Boolean(session.token);
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session.token) {
      inMemoryToken = session.token;
      inMemoryUser = session.user;
      setTokenState(session.token);
      setUser(session.user);
      setIsAuthenticated(true);
    } else {
      inMemoryToken = null;
      inMemoryUser = null;
      setTokenState(null);
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsAuthLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      const result = await adminLogin(username, password);
      inMemoryToken = result.access_token;
      inMemoryUser = result.user || null;
      setSessionStorage(result.access_token, result.user || null);
      setTokenState(inMemoryToken);
      setUser(inMemoryUser);
      setIsAuthenticated(true);
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    if (inMemoryToken) {
      try {
        await adminLogout(inMemoryToken);
      } catch {
        // ignore network error on logout
      }
    }
    inMemoryToken = null;
    inMemoryUser = null;
    clearSessionStorage();
    setTokenState(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    token: tokenState || inMemoryToken,
    user,
    login,
    logout,
    isAuthenticated,
    isAuthLoading,
  };
}
