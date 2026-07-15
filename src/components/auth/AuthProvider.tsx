"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  getMockSessionUser,
  listMockUsers,
  signInMockUser,
  signOutMockUser,
} from "@/lib/auth/mock-session";
import type { User } from "@/lib/types/domain";

const AUTH_EVENT = "universal-rating-auth";

function subscribe(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): User | null {
  return getMockSessionUser();
}

function getServerSnapshot(): User | null {
  return null;
}

function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  users: readonly User[];
  signIn: (userId: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const users = listMockUsers();

  const signIn = useCallback((userId: string) => {
    signInMockUser(userId);
    emitAuthChange();
  }, []);

  const signOut = useCallback(() => {
    signOutMockUser();
    emitAuthChange();
  }, []);

  const value = useMemo(
    () => ({ user, ready: true, users, signIn, signOut }),
    [user, users, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 须在 AuthProvider 内使用");
  return ctx;
}
