"use client";

/**
 * 理解万岁 · 登录态（Clerk）
 * 使用 Cursor 制作
 */

import {
  createContext,
  useContext,
  useMemo,
} from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { mapClerkToAppUser } from "@/lib/auth/clerk-meta";
import type { User } from "@/lib/types/domain";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const user = useMemo(() => {
    if (!clerkUser) return null;
    return mapClerkToAppUser({
      id: clerkUser.id,
      fullName: clerkUser.fullName,
      firstName: clerkUser.firstName,
      primaryEmail: clerkUser.primaryEmailAddress?.emailAddress ?? null,
      publicMetadata: clerkUser.publicMetadata as Record<string, unknown>,
    });
  }, [clerkUser]);

  const value = useMemo(
    () => ({
      user,
      ready: isLoaded,
      configured: true,
      signOut: async () => {
        await clerkSignOut({ redirectUrl: "/" });
      },
    }),
    [user, isLoaded, clerkSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 须在 AuthProvider 内使用");
  return ctx;
}
