"use client";

/**
 * 理解万岁 · 登录态（Supabase Auth）
 * 使用 Cursor 制作
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  mapAuthError,
  REAL_NAME_HINT,
  REAL_NAME_TAKEN_HINT,
} from "@/lib/auth/messages";
import {
  checkRealNameAvailable,
  fetchCurrentProfile,
} from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { User } from "@/lib/types/domain";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    realName: string;
  }) => Promise<{ needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    if (!configured) {
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setUser(null);
        setReady(true);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (cancelled) return;
        if (!session) {
          setUser(null);
          setReady(true);
          return;
        }
        try {
          const profile = await fetchCurrentProfile();
          if (!cancelled) setUser(profile);
        } catch {
          if (!cancelled) setUser(null);
        } finally {
          if (!cancelled) setReady(true);
        }
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) throw new Error("Supabase 未配置");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw new Error(mapAuthError(error.message));
    },
    [configured],
  );

  const signUp = useCallback(
    async (input: { email: string; password: string; realName: string }) => {
      if (!configured) throw new Error("Supabase 未配置");
      const realName = input.realName.trim();
      if (!realName) throw new Error(REAL_NAME_HINT);

      const available = await checkRealNameAvailable(realName);
      if (!available) {
        throw new Error(`真实姓名已被占用。${REAL_NAME_TAKEN_HINT}`);
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { real_name: realName },
        },
      });
      if (error) throw new Error(mapAuthError(error.message));

      return { needsEmailConfirm: !data.session };
    },
    [configured],
  );

  const signOut = useCallback(async () => {
    if (!configured) {
      setUser(null);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
  }, [configured]);

  const value = useMemo(
    () => ({
      user,
      ready,
      configured,
      signIn,
      signUp,
      signOut,
    }),
    [user, ready, configured, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 须在 AuthProvider 内使用");
  return ctx;
}
