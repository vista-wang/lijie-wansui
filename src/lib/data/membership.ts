/**
 * 理解万岁 · 会员 / 反馈 / 公告
 * 使用 Cursor 制作
 */

import { createId } from "@/lib/data/id";
import { loadMockStore, saveMockStore } from "@/lib/data/mock-store";
import type {
  Announcement,
  FeedbackItem,
  FeedbackPriority,
  MembershipTier,
} from "@/lib/types/membership";

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function getMembershipTier(userId: string | null): MembershipTier {
  if (!userId) return "free";
  const record = loadMockStore().memberships.find((m) => m.userId === userId);
  if (!record || record.tier === "free") return "free";
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    return "free";
  }
  return record.tier;
}

export function canSeeAds(userId: string | null): boolean {
  const tier = getMembershipTier(userId);
  return tier === "free";
}

export function membershipLabel(tier: MembershipTier): string {
  if (tier === "plus") return "高级会员";
  if (tier === "super") return "超级会员";
  return "普通用户";
}

/** 伪充值：开通 / 续费 30 天（本地 mock + 可选同步 Supabase） */
export function purchaseMembership(
  userId: string,
  tier: "plus" | "super",
): MembershipTier {
  const store = loadMockStore();
  const existing = store.memberships.find((m) => m.userId === userId);
  const base =
    existing?.expiresAt && new Date(existing.expiresAt).getTime() > Date.now()
      ? existing.expiresAt
      : nowIso();
  const expiresAt = addDays(base, 30);

  if (existing) {
    existing.tier = tier;
    existing.expiresAt = expiresAt;
  } else {
    store.memberships.push({ userId, tier, expiresAt });
  }
  saveMockStore(store);

  void syncMembershipToSupabase(userId, tier, expiresAt);

  return tier;
}

async function syncMembershipToSupabase(
  userId: string,
  tier: "plus" | "super",
  expiresAt: string,
): Promise<void> {
  try {
    const { isSupabaseConfigured } = await import("@/lib/supabase/env");
    if (!isSupabaseConfigured()) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("memberships").upsert({
      user_id: userId,
      tier,
      expires_at: expiresAt,
    });
  } catch {
    // 演示充值以本地为准；远端失败不阻断
  }
}

function priorityForTier(tier: MembershipTier): FeedbackPriority {
  if (tier === "super") return "super";
  if (tier === "plus") return "plus";
  return "normal";
}

export function submitFeedback(
  userId: string,
  body: string,
  tierOverride?: MembershipTier,
): FeedbackItem {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("请先写下你的想法");
  const tier = tierOverride ?? getMembershipTier(userId);
  const item: FeedbackItem = {
    id: createId("feedback"),
    authorId: userId,
    body: trimmed,
    priority: priorityForTier(tier),
    status: "open",
    createdAt: nowIso(),
  };
  const store = loadMockStore();
  store.feedbacks.unshift(item);
  saveMockStore(store);
  return item;
}

export function listMyFeedbacks(userId: string): FeedbackItem[] {
  return loadMockStore()
    .feedbacks.filter((f) => f.authorId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listFeedbacksForAdmin(kind: "plus" | "normal"): FeedbackItem[] {
  const store = loadMockStore();
  const list =
    kind === "plus"
      ? store.feedbacks.filter(
          (f) => f.priority === "plus" || f.priority === "super",
        )
      : store.feedbacks.filter((f) => f.priority === "normal");

  const rank = (p: FeedbackPriority) =>
    p === "super" ? 0 : p === "plus" ? 1 : 2;

  return list
    .slice()
    .sort(
      (a, b) =>
        rank(a.priority) - rank(b.priority) ||
        b.createdAt.localeCompare(a.createdAt),
    );
}

export function markFeedbackDone(id: string): void {
  const store = loadMockStore();
  const item = store.feedbacks.find((f) => f.id === id);
  if (!item) return;
  item.status = "done";
  saveMockStore(store);
}

export function listAnnouncements(
  userId: string | null,
  tierOverride?: MembershipTier,
): Announcement[] {
  const tier = tierOverride ?? getMembershipTier(userId);
  return loadMockStore()
    .announcements.filter((a) => !a.superOnly || tier === "super")
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createAnnouncement(input: {
  title: string;
  body: string;
  superOnly?: boolean;
}): Announcement {
  const item: Announcement = {
    id: createId("announce"),
    title: input.title.trim(),
    body: input.body.trim(),
    superOnly: input.superOnly,
    createdAt: nowIso(),
  };
  const store = loadMockStore();
  store.announcements.unshift(item);
  saveMockStore(store);
  return item;
}
