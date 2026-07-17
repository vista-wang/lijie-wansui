/**
 * 理解万岁 · 领域仓储（读：Supabase 快照；写：见 actions.ts）
 * 使用 Cursor 制作
 */

import {
  findProfileName,
  getStore,
} from "@/lib/data/store";
import {
  buildUserAffinityFeed,
  paginateFeed,
  todaySeed,
  type RecommendItem,
} from "@/lib/data/recommend";
import { summarizeScores } from "@/lib/data/score";
import { maskSensitiveText } from "@/lib/data/sensitive";
import type {
  AuditEvent,
  Comment,
  Instance,
  InstanceScoreSummary,
  PublicComment,
  PublicRating,
  Rating,
} from "@/lib/types/domain";
import type { MembershipTier } from "@/lib/types/membership";

function toPublicRating(rating: Rating): PublicRating {
  const anonymous = rating.anonymous !== false;
  return {
    id: rating.id,
    instanceId: rating.instanceId,
    score: rating.score,
    anonymous,
    displayName: anonymous ? null : (findProfileName(rating.authorId) ?? "用户"),
    createdAt: rating.createdAt,
    updatedAt: rating.updatedAt,
  };
}

function toPublicComment(comment: Comment): PublicComment {
  const anonymous = comment.anonymous !== false;
  return {
    id: comment.id,
    instanceId: comment.instanceId,
    body: comment.body,
    anonymous,
    displayName: anonymous
      ? null
      : (findProfileName(comment.authorId) ?? "用户"),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export function listInstances(): Instance[] {
  return getStore()
    .instances.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getInstance(id: string): Instance | null {
  return getStore().instances.find((i) => i.id === id) ?? null;
}

export function getPublicInstance(id: string): Instance | null {
  const instance = getInstance(id);
  if (!instance) return null;
  const words = getStore().sensitiveWords;
  return {
    ...instance,
    title: maskSensitiveText(instance.title, words),
    description: maskSensitiveText(instance.description, words),
  };
}

export function listPublicInstances(): Instance[] {
  const words = getStore().sensitiveWords;
  return listInstances().map((instance) => ({
    ...instance,
    title: maskSensitiveText(instance.title, words),
    description: maskSensitiveText(instance.description, words),
  }));
}

export function listPublicRatings(instanceId: string): PublicRating[] {
  return getStore()
    .ratings.filter((r) => r.instanceId === instanceId)
    .map(toPublicRating)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getInstanceScoreSummary(
  instanceId: string,
): InstanceScoreSummary | null {
  const store = getStore();
  const instance = store.instances.find((i) => i.id === instanceId);
  if (!instance) return null;
  const ratings = store.ratings.filter((r) => r.instanceId === instanceId);
  return summarizeScores(instance.scoringMode, ratings);
}

export type HotRankItem = {
  id: string;
  title: string;
  scoreLabel: string;
  count: number;
};

export type CategoryStat = {
  category: string;
  count: number;
};

export type RecentItem = {
  id: string;
  title: string;
  createdAt: string;
};

export function getSidebarPanels(): {
  hot: HotRankItem[];
  categories: CategoryStat[];
  recent: RecentItem[];
} {
  const store = getStore();
  const words = store.sensitiveWords;

  const hot = store.instances
    .map((instance) => {
      const ratings = store.ratings.filter((r) => r.instanceId === instance.id);
      const summary = summarizeScores(instance.scoringMode, ratings);
      const count = summary.count;
      let scoreLabel = "暂无";
      if (summary.mode === "scale_10" && summary.average != null) {
        scoreLabel = `${summary.average.toFixed(1)} 分`;
      } else if (summary.mode === "binary" && summary.count > 0) {
        scoreLabel = `${summary.approveCount}:${summary.opposeCount}`;
      }
      return {
        id: instance.id,
        title: maskSensitiveText(instance.title, words),
        scoreLabel,
        count,
      };
    })
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, 8);

  const categoryMap = new Map<string, number>();
  for (const instance of store.instances) {
    const key = instance.category?.trim() || "未分类";
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
  }
  const categories = [...categoryMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recent = store.instances
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)
    .map((instance) => ({
      id: instance.id,
      title: maskSensitiveText(instance.title, words),
      createdAt: instance.createdAt,
    }));

  return { hot, categories, recent };
}

export function getHomeRecommendPage(input: {
  userId: string | null;
  page: number;
  pageSize?: number;
}): { rows: RecommendItem[]; totalPages: number; page: number } {
  const store = getStore();
  const words = store.sensitiveWords;
  const publicInstances = store.instances.map((instance) => ({
    ...instance,
    title: maskSensitiveText(instance.title, words),
    description: maskSensitiveText(instance.description, words),
  }));

  const creatorTierByUserId = new Map<string, MembershipTier>();
  for (const m of store.memberships) {
    if (m.tier === "free") continue;
    if (m.expiresAt && new Date(m.expiresAt).getTime() < Date.now()) continue;
    creatorTierByUserId.set(m.userId, m.tier);
  }

  const feed = buildUserAffinityFeed({
    userId: input.userId,
    instances: publicInstances,
    ratings: store.ratings,
    options: {
      targetAgreeRatio: 0.5,
      minShare: 0.35,
      maxShare: 0.65,
      seed: `${todaySeed()}-${input.userId ?? "guest"}`,
      creatorTierByUserId,
    },
  });

  return paginateFeed(feed, input.page, input.pageSize ?? 6);
}

export function getMyRating(
  instanceId: string,
  authorId: string,
): Rating | null {
  return (
    getStore().ratings.find(
      (r) => r.instanceId === instanceId && r.authorId === authorId,
    ) ?? null
  );
}

export function listPublicComments(instanceId: string): PublicComment[] {
  const store = getStore();
  const words = store.sensitiveWords;
  return store.comments
    .filter((c) => c.instanceId === instanceId)
    .map(toPublicComment)
    .map((c) => ({ ...c, body: maskSensitiveText(c.body, words) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMyComment(
  instanceId: string,
  authorId: string,
): Comment | null {
  return (
    getStore().comments.find(
      (c) => c.instanceId === instanceId && c.authorId === authorId,
    ) ?? null
  );
}

export function listAuditEvents(): AuditEvent[] {
  return getStore()
    .auditEvents.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type MyRecordItem = {
  id: string;
  kind: "rating" | "comment";
  instanceId: string;
  instanceTitle: string;
  detail: string;
  at: string;
};

export function listMyRecords(authorId: string): MyRecordItem[] {
  const store = getStore();
  const words = store.sensitiveWords;
  const titleOf = (instanceId: string) => {
    const inst = store.instances.find((i) => i.id === instanceId);
    if (!inst) return "已删除的实例";
    return maskSensitiveText(inst.title, words);
  };

  const ratings: MyRecordItem[] = store.ratings
    .filter((r) => r.authorId === authorId)
    .map((r) => {
      const inst = store.instances.find((i) => i.id === r.instanceId);
      const detail =
        inst?.scoringMode === "binary"
          ? r.score === 1
            ? "赞成"
            : "反对"
          : `${r.score} 分`;
      return {
        id: r.id,
        kind: "rating" as const,
        instanceId: r.instanceId,
        instanceTitle: titleOf(r.instanceId),
        detail,
        at: r.updatedAt,
      };
    });

  const comments: MyRecordItem[] = store.comments
    .filter((c) => c.authorId === authorId)
    .map((c) => ({
      id: c.id,
      kind: "comment" as const,
      instanceId: c.instanceId,
      instanceTitle: titleOf(c.instanceId),
      detail: maskSensitiveText(c.body, words),
      at: c.updatedAt,
    }));

  return [...ratings, ...comments].sort((a, b) => b.at.localeCompare(a.at));
}
