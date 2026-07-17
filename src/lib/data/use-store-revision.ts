"use client";

import { useSyncExternalStore } from "react";
import { subscribeStore } from "@/lib/data/store-events";

let revision = 0;

function getRevision(): string {
  return String(revision);
}

const subscribe = (onChange: () => void) =>
  subscribeStore(() => {
    revision += 1;
    onChange();
  });

/** Supabase 快照变更时触发重渲染 */
export function useStoreRevision(): string {
  return useSyncExternalStore(subscribe, getRevision, () => "0");
}
