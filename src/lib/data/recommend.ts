/**
 * 理解万岁 · 用户亲和推荐（物以类聚、人以群分）
 * 使用 Cursor 制作
 *
 * - 人以群分：找评分方向相近的用户
 * - 物以类聚：推荐同类用户喜欢/不喜欢、且你尚未评价的实例
 * - 同意池与反对池按比例混排，避免单边刷屏
 */

import { buildInstanceMap, buildRatingIndexes } from "@/lib/data/indexes";
import { summarizeScores } from "@/lib/data/score";
import type {
  Instance,
  InstanceScoreSummary,
  Rating,
  ScoringMode,
} from "@/lib/types/domain";

export type Sentiment = "agree" | "oppose" | "neutral";

export interface RecommendItem {
  instance: Instance;
  summary: InstanceScoreSummary | null;
  sentiment: Sentiment;
}

export interface RecommendOptions {
  targetAgreeRatio?: number;
  minShare?: number;
  maxShare?: number;
  pageSize?: number;
  seed?: string;
}

/** 将用户对某实例的打分映射为极性 */
export function classifyUserScore(
  mode: ScoringMode,
  score: number,
): Sentiment {
  if (mode === "scale_10") {
    if (score >= 8) return "agree";
    if (score <= 3) return "oppose";
    return "neutral";
  }
  if (score === 1) return "agree";
  if (score === 0) return "oppose";
  return "neutral";
}

function polarValue(sentiment: Sentiment): 1 | -1 | 0 {
  if (sentiment === "agree") return 1;
  if (sentiment === "oppose") return -1;
  return 0;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const arr = items.slice();
  let state = hashSeed(seed) || 1;
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type PolarMap = Map<string, 1 | -1>;

function buildUserPolarMaps(
  ratings: readonly Rating[],
  instances: Map<string, Instance>,
): Map<string, PolarMap> {
  const indexes = buildRatingIndexes(ratings);
  const result = new Map<string, PolarMap>();

  for (const [userId, userRatings] of indexes.byUser) {
    const polar: PolarMap = new Map();
    for (const rating of userRatings) {
      const instance = instances.get(rating.instanceId);
      if (!instance) continue;
      const sentiment = classifyUserScore(instance.scoringMode, rating.score);
      const value = polarValue(sentiment);
      if (value !== 0) polar.set(rating.instanceId, value);
    }
    if (polar.size > 0) result.set(userId, polar);
  }
  return result;
}

function similarity(a: PolarMap, b: PolarMap): number {
  let shared = 0;
  let dot = 0;
  for (const [instanceId, av] of a) {
    const bv = b.get(instanceId);
    if (bv == null) continue;
    shared += 1;
    dot += av * bv;
  }
  if (shared === 0) return 0;
  return dot / shared;
}

function mixPools(
  agree: RecommendItem[],
  oppose: RecommendItem[],
  filler: RecommendItem[],
  options: RecommendOptions,
): RecommendItem[] {
  const targetAgreeRatio = options.targetAgreeRatio ?? 0.5;
  const maxShare = options.maxShare ?? 0.65;
  const seed = options.seed ?? "default";

  const a = seededShuffle(agree, `${seed}-a`);
  const o = seededShuffle(oppose, `${seed}-o`);
  const n = seededShuffle(filler, `${seed}-n`);

  const feed: RecommendItem[] = [];
  let ai = 0;
  let oi = 0;
  let agreeCount = 0;
  let opposeCount = 0;

  while (ai < a.length || oi < o.length) {
    const polar = agreeCount + opposeCount;
    const nextA = polar === 0 ? 0 : (agreeCount + 1) / (polar + 1);
    const nextO = polar === 0 ? 0 : (opposeCount + 1) / (polar + 1);
    const canA = ai < a.length && nextA <= maxShare;
    const canO = oi < o.length && nextO <= maxShare;

    let pick: "a" | "o" | null = null;
    if (canA && canO) {
      const ratio = polar === 0 ? targetAgreeRatio : agreeCount / polar;
      pick = ratio < targetAgreeRatio ? "a" : "o";
    } else if (canA) pick = "a";
    else if (canO) pick = "o";
    else if (ai < a.length) pick = "a";
    else if (oi < o.length) pick = "o";

    if (pick === "a") {
      feed.push(a[ai++]);
      agreeCount += 1;
    } else if (pick === "o") {
      feed.push(o[oi++]);
      opposeCount += 1;
    } else break;

    if (feed.length % 3 === 0 && n.length > 0) {
      feed.push(n.shift()!);
    }
  }

  return feed.concat(n);
}

function summarizeMap(
  instances: readonly Instance[],
  ratings: readonly Rating[],
): Map<string, InstanceScoreSummary> {
  const indexes = buildRatingIndexes(ratings);
  const map = new Map<string, InstanceScoreSummary>();
  for (const instance of instances) {
    const list = indexes.byInstance.get(instance.id) ?? [];
    map.set(instance.id, summarizeScores(instance.scoringMode, list));
  }
  return map;
}

/**
 * 冷启动：无登录或无极化评分时，用全局高低分实例做比例混排。
 */
function coldStartFeed(
  instances: readonly Instance[],
  ratings: readonly Rating[],
  options: RecommendOptions,
): RecommendItem[] {
  const summaries = summarizeMap(instances, ratings);
  const agree: RecommendItem[] = [];
  const oppose: RecommendItem[] = [];
  const filler: RecommendItem[] = [];

  for (const instance of instances) {
    const summary = summaries.get(instance.id) ?? null;
    let sentiment: Sentiment = "neutral";
    if (summary && summary.mode === "scale_10" && summary.average != null) {
      if (summary.average >= 8) sentiment = "agree";
      else if (summary.average <= 3) sentiment = "oppose";
    } else if (summary && summary.mode === "binary") {
      const margin = Math.abs(summary.approveCount - summary.opposeCount);
      if (margin >= 2 && summary.majority === "approve") sentiment = "agree";
      if (margin >= 2 && summary.majority === "oppose") sentiment = "oppose";
    }
    const item = { instance, summary, sentiment };
    if (sentiment === "agree") agree.push(item);
    else if (sentiment === "oppose") oppose.push(item);
    else filler.push(item);
  }

  return mixPools(agree, oppose, filler, options);
}

/**
 * 基于当前用户偏好的协同推荐。
 */
export function buildUserAffinityFeed(input: {
  userId: string | null;
  instances: readonly Instance[];
  ratings: readonly Rating[];
  options?: RecommendOptions;
}): RecommendItem[] {
  const options = input.options ?? {};
  const instanceMap = buildInstanceMap(input.instances);
  const summaries = summarizeMap(input.instances, input.ratings);
  const polars = buildUserPolarMaps(input.ratings, instanceMap);

  if (!input.userId || !polars.has(input.userId)) {
    return coldStartFeed(input.instances, input.ratings, options);
  }

  const me = polars.get(input.userId)!;
  const rated = new Set(me.keys());

  // 人也群分：相似度
  const sims: { userId: string; sim: number }[] = [];
  for (const [otherId, otherPolar] of polars) {
    if (otherId === input.userId) continue;
    const sim = similarity(me, otherPolar);
    if (sim > 0.15) sims.push({ userId: otherId, sim });
  }
  sims.sort((a, b) => b.sim - a.sim);

  // 物以类聚：同类用户的同意/反对加权
  const agreeScore = new Map<string, number>();
  const opposeScore = new Map<string, number>();

  for (const { userId, sim } of sims) {
    const polar = polars.get(userId)!;
    for (const [instanceId, value] of polar) {
      if (rated.has(instanceId)) continue;
      if (value === 1) {
        agreeScore.set(instanceId, (agreeScore.get(instanceId) ?? 0) + sim);
      } else {
        opposeScore.set(instanceId, (opposeScore.get(instanceId) ?? 0) + sim);
      }
    }
  }

  // 类别加成：你同意过的分类 → 同意池；反对过的分类 → 反对池
  const likedCategories = new Set<string>();
  const dislikedCategories = new Set<string>();
  for (const [instanceId, value] of me) {
    const cat = instanceMap.get(instanceId)?.category;
    if (!cat) continue;
    if (value === 1) likedCategories.add(cat);
    else dislikedCategories.add(cat);
  }

  for (const instance of input.instances) {
    if (rated.has(instance.id)) continue;
    if (!instance.category) continue;
    if (likedCategories.has(instance.category)) {
      agreeScore.set(instance.id, (agreeScore.get(instance.id) ?? 0) + 0.35);
    }
    if (dislikedCategories.has(instance.category)) {
      opposeScore.set(instance.id, (opposeScore.get(instance.id) ?? 0) + 0.35);
    }
  }

  const agree: RecommendItem[] = [];
  const oppose: RecommendItem[] = [];
  const filler: RecommendItem[] = [];
  const used = new Set<string>();

  const candidates = new Set([
    ...agreeScore.keys(),
    ...opposeScore.keys(),
  ]);

  for (const instanceId of candidates) {
    const instance = instanceMap.get(instanceId);
    if (!instance) continue;
    const a = agreeScore.get(instanceId) ?? 0;
    const o = opposeScore.get(instanceId) ?? 0;
    const summary = summaries.get(instanceId) ?? null;
    if (a >= o + 0.2) {
      agree.push({ instance, summary, sentiment: "agree" });
      used.add(instanceId);
    } else if (o >= a + 0.2) {
      oppose.push({ instance, summary, sentiment: "oppose" });
      used.add(instanceId);
    }
  }

  for (const instance of input.instances) {
    if (rated.has(instance.id) || used.has(instance.id)) continue;
    filler.push({
      instance,
      summary: summaries.get(instance.id) ?? null,
      sentiment: "neutral",
    });
  }

  return mixPools(agree, oppose, filler, options);
}

export function paginateFeed(
  feed: RecommendItem[],
  page: number,
  pageSize = 6,
): { rows: RecommendItem[]; totalPages: number; page: number } {
  const totalPages = Math.max(1, Math.ceil(feed.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    rows: feed.slice(start, start + pageSize),
    totalPages,
    page: current,
  };
}

export function todaySeed(): string {
  return new Date().toISOString().slice(0, 10);
}
