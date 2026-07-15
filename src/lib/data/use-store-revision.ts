"use client";

import { useSyncExternalStore } from "react";
import { subscribeStore } from "@/lib/data/store-events";

const STORAGE_KEY = "universal-rating.mock-store.v8";

function getRevision(): string {
  if (typeof window === "undefined") return "0";
  return window.localStorage.getItem(STORAGE_KEY) ?? "0";
}

/** 本地 mock 存储变更时触发重渲染 */
export function useStoreRevision(): string {
  return useSyncExternalStore(subscribeStore, getRevision, () => "0");
}
