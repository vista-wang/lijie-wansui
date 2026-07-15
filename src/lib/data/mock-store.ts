/**
 * 理解万岁 · 本地 mock 存储
 * 使用 Cursor 制作
 */

import { emitStoreChange } from "@/lib/data/store-events";
import { buildDemoCatalog } from "@/lib/data/seed-catalog";
import type {
  AuditEvent,
  Comment,
  Instance,
  Rating,
} from "@/lib/types/domain";

const STORAGE_KEY = "universal-rating.mock-store.v6";

export interface MockStoreData {
  instances: Instance[];
  ratings: Rating[];
  comments: Comment[];
  auditEvents: AuditEvent[];
  sensitiveWords: string[];
}

function seedStore(): MockStoreData {
  const catalog = buildDemoCatalog();
  return {
    ...catalog,
    sensitiveWords: ["垃圾", "白痴", "去死"],
  };
}

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function normalizeStore(data: Partial<MockStoreData>): MockStoreData {
  const seeded = seedStore();
  const instances = data.instances?.length
    ? data.instances
    : seeded.instances;
  // 旧版实例过少时整包替换，保证推荐与分页可用
  if (instances.length < 20) {
    return seeded;
  }
  return {
    instances,
    ratings: data.ratings?.length ? data.ratings : seeded.ratings,
    comments: data.comments?.length ? data.comments : seeded.comments,
    auditEvents: data.auditEvents?.length
      ? data.auditEvents
      : seeded.auditEvents,
    sensitiveWords: data.sensitiveWords?.length
      ? data.sensitiveWords
      : seeded.sensitiveWords,
  };
}

export function loadMockStore(): MockStoreData {
  if (!canUseStorage()) {
    return seedStore();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return structuredClone(seeded);
    }
    const parsed = JSON.parse(raw) as Partial<MockStoreData>;
    const normalized = normalizeStore(parsed);
    if ((parsed.instances?.length ?? 0) < 20) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return seedStore();
  }
}

export function saveMockStore(data: MockStoreData): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitStoreChange();
}

export function resetMockStore(): MockStoreData {
  const seeded = seedStore();
  saveMockStore(seeded);
  return structuredClone(seeded);
}
