/**
 * 理解万岁 · 推荐混排
 * 使用 Cursor 制作
 *
 * 「很同意」与「很反对」按目标比例交错；单页任一侧占比夹在 minShare~maxShare。
 */

import type { Instance, InstanceScoreSummary } from "@/lib/types/domain";

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

/**
 * 内部混排用（不展示文案）：
 * - scale_10：均分 ≥8 / ≤3
 * - binary：必须「明显」占优（票差 ≥ 2），避免 2:1 这种弱多数被当成强同意
 *   （例如李明投反对、另两人赞成 → 中性，不进同意池）
 */
export function classifySentiment(
  summary: InstanceScoreSummary | null,
): Sentiment {
  if (!summary || summary.count === 0) return "neutral";

  if (summary.mode === "scale_10") {
    if (summary.average == null) return "neutral";
    if (summary.average >= 8) return "agree";
    if (summary.average <= 3) return "oppose";
    return "neutral";
  }

  const margin = Math.abs(summary.approveCount - summary.opposeCount);
  if (margin < 2) return "neutral";
  if (summary.majority === "approve") return "agree";
  if (summary.majority === "oppose") return "oppose";
  return "neutral";
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

function polarRatio(items: RecommendItem[]): { agree: number; oppose: number } {
  let agree = 0;
  let oppose = 0;
  for (const item of items) {
    if (item.sentiment === "agree") agree += 1;
    if (item.sentiment === "oppose") oppose += 1;
  }
  return { agree, oppose };
}

/** 交错混排：优先维持目标同意占比，并避免任一侧在已有极化项中越界 */
export function buildMixedFeed(
  items: RecommendItem[],
  options: RecommendOptions = {},
): RecommendItem[] {
  const targetAgreeRatio = options.targetAgreeRatio ?? 0.5;
  const maxShare = options.maxShare ?? 0.65;
  const seed = options.seed ?? "default";

  const agree = seededShuffle(
    items.filter((i) => i.sentiment === "agree"),
    `${seed}-a`,
  );
  const oppose = seededShuffle(
    items.filter((i) => i.sentiment === "oppose"),
    `${seed}-o`,
  );
  const neutral = seededShuffle(
    items.filter((i) => i.sentiment === "neutral"),
    `${seed}-n`,
  );

  const feed: RecommendItem[] = [];
  let ai = 0;
  let oi = 0;

  while (ai < agree.length || oi < oppose.length) {
    const { agree: a, oppose: o } = polarRatio(feed);
    const polar = a + o;
    const nextAgreeRatio = polar === 0 ? 0 : (a + 1) / (polar + 1);
    const nextOpposeRatio = polar === 0 ? 0 : (o + 1) / (polar + 1);

    const canAgree = ai < agree.length && nextAgreeRatio <= maxShare;
    const canOppose = oi < oppose.length && nextOpposeRatio <= maxShare;

    let pick: "agree" | "oppose" | null = null;
    if (canAgree && canOppose) {
      const currentAgreeRatio = polar === 0 ? targetAgreeRatio : a / polar;
      pick = currentAgreeRatio < targetAgreeRatio ? "agree" : "oppose";
    } else if (canAgree) {
      pick = "agree";
    } else if (canOppose) {
      pick = "oppose";
    } else if (ai < agree.length) {
      pick = "agree";
    } else if (oi < oppose.length) {
      pick = "oppose";
    }

    if (pick === "agree") {
      feed.push(agree[ai++]);
    } else if (pick === "oppose") {
      feed.push(oppose[oi++]);
    } else {
      break;
    }
  }

  // 中性项按间隔插入，避免极化段过长
  const withNeutral: RecommendItem[] = [];
  let ni = 0;
  for (let i = 0; i < feed.length; i++) {
    withNeutral.push(feed[i]);
    if ((i + 1) % 3 === 0 && ni < neutral.length) {
      withNeutral.push(neutral[ni++]);
    }
  }
  while (ni < neutral.length) {
    withNeutral.push(neutral[ni++]);
  }

  return withNeutral;
}

/** 分页后再次钳制本页同意/反对占比 */
export function paginateBalanced(
  feed: RecommendItem[],
  page: number,
  options: RecommendOptions = {},
): { rows: RecommendItem[]; totalPages: number } {
  const pageSize = options.pageSize ?? 5;
  const minShare = options.minShare ?? 0.35;
  const maxShare = options.maxShare ?? 0.65;
  const totalPages = Math.max(1, Math.ceil(feed.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  let rows = feed.slice(start, start + pageSize);

  rows = clampPageShares(rows, feed, start, pageSize, minShare, maxShare);

  return { rows, totalPages };
}

function clampPageShares(
  pageRows: RecommendItem[],
  feed: RecommendItem[],
  start: number,
  pageSize: number,
  minShare: number,
  maxShare: number,
): RecommendItem[] {
  const rows = pageRows.slice();
  const used = new Set(rows.map((r) => r.instance.id));
  const outside = feed.filter((i) => !used.has(i.instance.id));

  const polarOf = (list: RecommendItem[]) => polarRatio(list);
  const ratioOf = (side: number, polar: number) =>
    polar === 0 ? 0.5 : side / polar;

  // 砍掉过多一侧，用页外另一侧替换
  for (let guard = 0; guard < pageSize * 2; guard++) {
    const { agree: a, oppose: o } = polarOf(rows);
    const polar = a + o;
    if (polar < 2) break;

    if (ratioOf(a, polar) > maxShare) {
      const idx = rows.findIndex((r) => r.sentiment === "agree");
      const replacement = outside.find((r) => r.sentiment === "oppose");
      if (idx < 0 || !replacement) break;
      used.delete(rows[idx].instance.id);
      rows[idx] = replacement;
      used.add(replacement.instance.id);
      outside.splice(outside.indexOf(replacement), 1);
      continue;
    }

    if (ratioOf(o, polar) > maxShare) {
      const idx = rows.findIndex((r) => r.sentiment === "oppose");
      const replacement = outside.find((r) => r.sentiment === "agree");
      if (idx < 0 || !replacement) break;
      used.delete(rows[idx].instance.id);
      rows[idx] = replacement;
      used.add(replacement.instance.id);
      outside.splice(outside.indexOf(replacement), 1);
      continue;
    }

    // 过少：用页外同侧补（若页面未满）或替换中性
    if (ratioOf(a, polar) < minShare) {
      const replacement = outside.find((r) => r.sentiment === "agree");
      const idx =
        rows.findIndex((r) => r.sentiment === "neutral") >= 0
          ? rows.findIndex((r) => r.sentiment === "neutral")
          : rows.findIndex((r) => r.sentiment === "oppose");
      if (!replacement || idx < 0) break;
      used.delete(rows[idx].instance.id);
      rows[idx] = replacement;
      used.add(replacement.instance.id);
      outside.splice(outside.indexOf(replacement), 1);
      continue;
    }

    if (ratioOf(o, polar) < minShare) {
      const replacement = outside.find((r) => r.sentiment === "oppose");
      const idx =
        rows.findIndex((r) => r.sentiment === "neutral") >= 0
          ? rows.findIndex((r) => r.sentiment === "neutral")
          : rows.findIndex((r) => r.sentiment === "agree");
      if (!replacement || idx < 0) break;
      used.delete(rows[idx].instance.id);
      rows[idx] = replacement;
      used.add(replacement.instance.id);
      outside.splice(outside.indexOf(replacement), 1);
      continue;
    }

    break;
  }

  while (rows.length < pageSize && outside.length > 0) {
    rows.push(outside.shift()!);
  }

  return rows;
}

export function toRecommendItems(
  rows: {
    instance: Instance;
    summary: InstanceScoreSummary | null;
  }[],
): RecommendItem[] {
  return rows.map((row) => ({
    ...row,
    sentiment: classifySentiment(row.summary),
  }));
}

export function todaySeed(): string {
  return new Date().toISOString().slice(0, 10);
}
