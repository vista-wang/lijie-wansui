import { createId } from "@/lib/data/id";
import {
  loadMockStore,
  saveMockStore,
  type MockStoreData,
} from "@/lib/data/mock-store";
import {
  buildUserAffinityFeed,
  paginateFeed,
  todaySeed,
  type RecommendItem,
} from "@/lib/data/recommend";
import { assertValidScore, summarizeScores } from "@/lib/data/score";
import { maskSensitiveText } from "@/lib/data/sensitive";
import type {
  AuditEvent,
  Comment,
  Instance,
  InstanceScoreSummary,
  PublicComment,
  PublicRating,
  Rating,
  ScoringMode,
} from "@/lib/types/domain";

function nowIso(): string {
  return new Date().toISOString();
}

function withStore<T>(mutate: (store: MockStoreData) => T): T {
  const store = loadMockStore();
  const result = mutate(store);
  saveMockStore(store);
  return result;
}

function appendAudit(
  store: MockStoreData,
  event: Omit<AuditEvent, "id" | "createdAt"> & { createdAt?: string },
): void {
  store.auditEvents.push({
    id: createId("audit"),
    createdAt: event.createdAt ?? nowIso(),
    actorId: event.actorId,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    payload: event.payload,
  });
}

function toPublicRating({ authorId, ...rest }: Rating): PublicRating {
  void authorId;
  return rest;
}

function toPublicComment({ authorId, ...rest }: Comment): PublicComment {
  void authorId;
  return rest;
}

export function listInstances(): Instance[] {
  return loadMockStore().instances.slice().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getInstance(id: string): Instance | null {
  return loadMockStore().instances.find((i) => i.id === id) ?? null;
}

export function getPublicInstance(id: string): Instance | null {
  const instance = getInstance(id);
  if (!instance) return null;
  const words = loadMockStore().sensitiveWords;
  return {
    ...instance,
    title: maskSensitiveText(instance.title, words),
    description: maskSensitiveText(instance.description, words),
  };
}

export function listPublicInstances(): Instance[] {
  const words = loadMockStore().sensitiveWords;
  return listInstances().map((instance) => ({
    ...instance,
    title: maskSensitiveText(instance.title, words),
    description: maskSensitiveText(instance.description, words),
  }));
}

export function createInstance(input: {
  title: string;
  description: string;
  scoringMode: ScoringMode;
  category?: string;
  actorId: string;
}): Instance {
  return withStore((store) => {
    const createdAt = nowIso();
    const instance: Instance = {
      id: createId("instance"),
      title: input.title.trim(),
      description: input.description.trim(),
      scoringMode: input.scoringMode,
      category: input.category?.trim() || undefined,
      createdBy: input.actorId,
      createdAt,
    };
    store.instances.push(instance);
    appendAudit(store, {
      actorId: input.actorId,
      action: "instance.create",
      entityType: "instance",
      entityId: instance.id,
      createdAt,
    });
    return instance;
  });
}

export function listPublicRatings(instanceId: string): PublicRating[] {
  return loadMockStore()
    .ratings.filter((r) => r.instanceId === instanceId)
    .map(toPublicRating)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getInstanceScoreSummary(
  instanceId: string,
): InstanceScoreSummary | null {
  const store = loadMockStore();
  const instance = store.instances.find((i) => i.id === instanceId);
  if (!instance) return null;
  const ratings = store.ratings.filter((r) => r.instanceId === instanceId);
  return summarizeScores(instance.scoringMode, ratings);
}

/** 主页推荐：按用户亲和混排并分页（仅客户端调用，避免 hydration 偏差） */
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

/** 桌面侧栏：热门 / 分类 / 最新 */
export function getSidebarPanels(): {
  hot: HotRankItem[];
  categories: CategoryStat[];
  recent: RecentItem[];
} {
  const store = loadMockStore();
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
  const store = loadMockStore();
  const words = store.sensitiveWords;
  const publicInstances = store.instances.map((instance) => ({
    ...instance,
    title: maskSensitiveText(instance.title, words),
    description: maskSensitiveText(instance.description, words),
  }));

  const feed = buildUserAffinityFeed({
    userId: input.userId,
    instances: publicInstances,
    ratings: store.ratings,
    options: {
      targetAgreeRatio: 0.5,
      minShare: 0.35,
      maxShare: 0.65,
      seed: `${todaySeed()}-${input.userId ?? "guest"}`,
    },
  });

  return paginateFeed(feed, input.page, input.pageSize ?? 6);
}

export function getMyRating(
  instanceId: string,
  authorId: string,
): Rating | null {
  return (
    loadMockStore().ratings.find(
      (r) => r.instanceId === instanceId && r.authorId === authorId,
    ) ?? null
  );
}

/** Create or update the single rating for this account on the instance. */
export function upsertRating(input: {
  instanceId: string;
  authorId: string;
  score: number;
}): Rating {
  return withStore((store) => {
    const instance = store.instances.find((i) => i.id === input.instanceId);
    if (!instance) throw new Error("未找到该实例");
    assertValidScore(instance.scoringMode, input.score);

    const existing = store.ratings.find(
      (r) =>
        r.instanceId === input.instanceId && r.authorId === input.authorId,
    );
    const updatedAt = nowIso();

    if (existing) {
      existing.score = input.score;
      existing.updatedAt = updatedAt;
      appendAudit(store, {
        actorId: input.authorId,
        action: "rating.update",
        entityType: "rating",
        entityId: existing.id,
        createdAt: updatedAt,
        payload: { score: input.score },
      });
      return { ...existing };
    }

    const rating: Rating = {
      id: createId("rating"),
      instanceId: input.instanceId,
      authorId: input.authorId,
      score: input.score,
      createdAt: updatedAt,
      updatedAt,
    };
    store.ratings.push(rating);
    appendAudit(store, {
      actorId: input.authorId,
      action: "rating.create",
      entityType: "rating",
      entityId: rating.id,
      createdAt: updatedAt,
      payload: { score: input.score },
    });
    return rating;
  });
}

export function listPublicComments(instanceId: string): PublicComment[] {
  const store = loadMockStore();
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
    loadMockStore().comments.find(
      (c) => c.instanceId === instanceId && c.authorId === authorId,
    ) ?? null
  );
}

/** First comment only. Throws if a second comment is attempted. */
export function createComment(input: {
  instanceId: string;
  authorId: string;
  body: string;
}): Comment {
  return withStore((store) => {
    const instance = store.instances.find((i) => i.id === input.instanceId);
    if (!instance) throw new Error("未找到该实例");

    const existing = store.comments.find(
      (c) =>
        c.instanceId === input.instanceId && c.authorId === input.authorId,
    );
    if (existing) {
      throw new Error("同一账号不能二次评论");
    }

    const createdAt = nowIso();
    const comment: Comment = {
      id: createId("comment"),
      instanceId: input.instanceId,
      authorId: input.authorId,
      body: input.body.trim(),
      createdAt,
      updatedAt: createdAt,
    };
    store.comments.push(comment);
    appendAudit(store, {
      actorId: input.authorId,
      action: "comment.create",
      entityType: "comment",
      entityId: comment.id,
      createdAt,
    });
    return comment;
  });
}

/** Edit the single existing comment. */
export function updateComment(input: {
  instanceId: string;
  authorId: string;
  body: string;
}): Comment {
  return withStore((store) => {
    const existing = store.comments.find(
      (c) =>
        c.instanceId === input.instanceId && c.authorId === input.authorId,
    );
    if (!existing) throw new Error("未找到评论");

    const updatedAt = nowIso();
    existing.body = input.body.trim();
    existing.updatedAt = updatedAt;
    appendAudit(store, {
      actorId: input.authorId,
      action: "comment.update",
      entityType: "comment",
      entityId: existing.id,
      createdAt: updatedAt,
    });
    return { ...existing };
  });
}

export function listAuditEvents(): AuditEvent[] {
  return loadMockStore()
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

/** 当前账号的评分与评论（本人可见，含实名语境下的操作记录） */
export function listMyRecords(authorId: string): MyRecordItem[] {
  const store = loadMockStore();
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
