"use client";

/**
 * 理解万岁 · 数据水合（Supabase）
 * 使用 Cursor 制作
 */

import { useAuth, useUser } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ensureProfileAction } from "@/lib/data/actions";
import {
  clearLegacyMockStorage,
  ensureHydrated,
  isStoreHydrated,
  refreshStore,
} from "@/lib/data/store";
import { subscribeStore } from "@/lib/data/store-events";

type DataContextValue = {
  ready: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const [ready, setReady] = useState(isStoreHydrated());
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      await refreshStore();
      setReady(true);
      setTick((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setReady(true);
    }
  }, []);

  useEffect(() => {
    clearLegacyMockStorage();
    void ensureHydrated()
      .then(() => {
        setReady(true);
        setTick((n) => n + 1);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "加载失败");
        setReady(true);
      });
    return subscribeStore(() => setTick((n) => n + 1));
  }, []);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    let cancelled = false;
    void ensureProfileAction()
      .then(async () => {
        if (cancelled) return;
        await clerkUser?.reload();
        await refresh();
      })
      .catch(() => {
        // 无真名时占位；账号页可再填
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId, refresh, clerkUser]);

  const value = useMemo(
    () => ({ ready, error, refresh }),
    [ready, error, refresh],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData 须在 DataProvider 内使用");
  return ctx;
}
