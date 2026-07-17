/**
 * 理解万岁 · Supabase 内存快照（无假数据）
 * 使用 Cursor 制作
 */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { emitStoreChange } from "@/lib/data/store-events";
import type {
  AuditEvent,
  AuditAction,
  Comment,
  Instance,
  Rating,
  ScoringMode,
  UserRole,
} from "@/lib/types/domain";
import type {
  Announcement,
  FeedbackItem,
  FeedbackPriority,
  MembershipRecord,
  MembershipTier,
} from "@/lib/types/membership";

export type ProfileRow = {
  id: string;
  realName: string;
  email: string;
  role: UserRole;
};

export interface AppStoreData {
  profiles: ProfileRow[];
  instances: Instance[];
  ratings: Rating[];
  comments: Comment[];
  auditEvents: AuditEvent[];
  sensitiveWords: string[];
  memberships: MembershipRecord[];
  feedbacks: FeedbackItem[];
  announcements: Announcement[];
}

const EMPTY: AppStoreData = {
  profiles: [],
  instances: [],
  ratings: [],
  comments: [],
  auditEvents: [],
  sensitiveWords: [],
  memberships: [],
  feedbacks: [],
  announcements: [],
};

let cache: AppStoreData = structuredClone(EMPTY);
let hydrated = false;
let hydratePromise: Promise<void> | null = null;

export function isStoreHydrated(): boolean {
  return hydrated;
}

export function getStore(): AppStoreData {
  return cache;
}

export function findProfileName(userId: string): string | null {
  return cache.profiles.find((p) => p.id === userId)?.realName ?? null;
}

function mapInstance(row: Record<string, unknown>): Instance {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    scoringMode: row.scoring_mode as ScoringMode,
    category: row.category ? String(row.category) : undefined,
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
  };
}

function mapRating(row: Record<string, unknown>): Rating {
  return {
    id: String(row.id),
    instanceId: String(row.instance_id),
    authorId: String(row.author_id),
    score: Number(row.score),
    anonymous: row.anonymous !== false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapComment(row: Record<string, unknown>): Comment {
  return {
    id: String(row.id),
    instanceId: String(row.instance_id),
    authorId: String(row.author_id),
    body: String(row.body),
    anonymous: row.anonymous !== false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapAudit(row: Record<string, unknown>): AuditEvent {
  return {
    id: String(row.id),
    actorId: String(row.actor_id),
    action: row.action as AuditAction,
    entityType: row.entity_type as AuditEvent["entityType"],
    entityId: String(row.entity_id),
    createdAt: String(row.created_at),
    payload: (row.payload as Record<string, unknown> | null) ?? undefined,
  };
}

function mapMembership(row: Record<string, unknown>): MembershipRecord {
  return {
    userId: String(row.user_id),
    tier: row.tier as MembershipTier,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
  };
}

function mapFeedback(row: Record<string, unknown>): FeedbackItem {
  return {
    id: String(row.id),
    authorId: String(row.author_id),
    body: String(row.body),
    priority: row.priority as FeedbackPriority,
    status: row.status as FeedbackItem["status"],
    createdAt: String(row.created_at),
  };
}

function mapAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id: String(row.id),
    title: String(row.title),
    body: String(row.body),
    superOnly: Boolean(row.super_only),
    createdAt: String(row.created_at),
  };
}

function mapProfile(row: Record<string, unknown>): ProfileRow {
  return {
    id: String(row.id),
    realName: String(row.real_name),
    email: String(row.email ?? ""),
    role: (row.role as UserRole) || "user",
  };
}

/** 从 Supabase 拉取全量快照；无假数据回填。 */
export async function refreshStore(): Promise<AppStoreData> {
  if (!isSupabaseConfigured()) {
    cache = structuredClone(EMPTY);
    hydrated = true;
    emitStoreChange();
    return cache;
  }

  const supabase = createClient();
  const [
    profilesRes,
    instancesRes,
    ratingsRes,
    commentsRes,
    auditRes,
    wordsRes,
    membershipsRes,
    feedbacksRes,
    announcementsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("instances").select("*").order("created_at", { ascending: false }),
    supabase.from("ratings").select("*"),
    supabase.from("comments").select("*"),
    supabase.from("audit_events").select("*").order("created_at", { ascending: false }),
    supabase.from("sensitive_words").select("word"),
    supabase.from("memberships").select("*"),
    supabase.from("feedbacks").select("*").order("created_at", { ascending: false }),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }),
  ]);

  const firstError =
    profilesRes.error ||
    instancesRes.error ||
    ratingsRes.error ||
    commentsRes.error ||
    auditRes.error ||
    wordsRes.error ||
    membershipsRes.error ||
    feedbacksRes.error ||
    announcementsRes.error;
  if (firstError) {
    console.error("Supabase 拉取失败", firstError.message);
    throw new Error(`加载数据失败：${firstError.message}`);
  }

  cache = {
    profiles: (profilesRes.data ?? []).map((r) => mapProfile(r as Record<string, unknown>)),
    instances: (instancesRes.data ?? []).map((r) => mapInstance(r as Record<string, unknown>)),
    ratings: (ratingsRes.data ?? []).map((r) => mapRating(r as Record<string, unknown>)),
    comments: (commentsRes.data ?? []).map((r) => mapComment(r as Record<string, unknown>)),
    auditEvents: (auditRes.data ?? []).map((r) => mapAudit(r as Record<string, unknown>)),
    sensitiveWords: (wordsRes.data ?? []).map((r) => String((r as { word: string }).word)),
    memberships: (membershipsRes.data ?? []).map((r) =>
      mapMembership(r as Record<string, unknown>),
    ),
    feedbacks: (feedbacksRes.data ?? []).map((r) => mapFeedback(r as Record<string, unknown>)),
    announcements: (announcementsRes.data ?? []).map((r) =>
      mapAnnouncement(r as Record<string, unknown>),
    ),
  };
  hydrated = true;
  emitStoreChange();
  return cache;
}

export function ensureHydrated(): Promise<void> {
  if (hydrated) return Promise.resolve();
  if (!hydratePromise) {
    hydratePromise = refreshStore()
      .then(() => undefined)
      .finally(() => {
        hydratePromise = null;
      });
  }
  return hydratePromise;
}

/** 清掉旧版 localStorage 假数据 */
export function clearLegacyMockStorage(): void {
  if (typeof window === "undefined") return;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("universal-rating.mock-store")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}
