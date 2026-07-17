/**
 * 理解万岁 · 会员 / 反馈 / 公告（读快照；写见 actions）
 * 使用 Cursor 制作
 */

import { getStore } from "@/lib/data/store";
import type {
  Announcement,
  FeedbackItem,
  FeedbackPriority,
  MembershipTier,
} from "@/lib/types/membership";

export function getMembershipTier(userId: string | null): MembershipTier {
  if (!userId) return "free";
  const record = getStore().memberships.find((m) => m.userId === userId);
  if (!record || record.tier === "free") return "free";
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    return "free";
  }
  return record.tier;
}

export function canSeeAds(userId: string | null): boolean {
  return getMembershipTier(userId) === "free";
}

export function membershipLabel(tier: MembershipTier): string {
  if (tier === "plus") return "高级会员";
  if (tier === "super") return "超级会员";
  return "普通用户";
}

export function listMyFeedbacks(userId: string): FeedbackItem[] {
  return getStore()
    .feedbacks.filter((f) => f.authorId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listFeedbacksForAdmin(kind: "plus" | "normal"): FeedbackItem[] {
  const store = getStore();
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

export function listAnnouncements(
  _userId: string | null,
  tierOverride?: MembershipTier,
): Announcement[] {
  const tier = tierOverride ?? "free";
  return getStore()
    .announcements.filter((a) => !a.superOnly || tier === "super")
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
