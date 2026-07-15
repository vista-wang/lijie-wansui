"use client";

import { useSyncExternalStore } from "react";

/** 避免 SSR 与 localStorage 数据不一致导致 hydration mismatch */
export function useClientReady(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
