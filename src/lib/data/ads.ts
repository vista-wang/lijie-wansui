/**
 * 理解万岁 · 广告库存与随机穿插
 * 使用 Cursor 制作
 *
 * 位置不固定：按种子在信息流中间隔插入，侧栏/页内多处投放。
 */

export type AdCreative = {
  id: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "blue" | "warm" | "mint" | "violet";
};

export const AD_CREATIVES: readonly AdCreative[] = [
  {
    id: "ad-life-1",
    title: "周末探店指南",
    body: "附近好评小店合集，点开看看合不合你口味。",
    cta: "去看看",
    href: "/membership",
    tone: "warm",
  },
  {
    id: "ad-life-2",
    title: "社区团购上新",
    body: "本周生鲜直送，评价区里大家讨论很热闹。",
    cta: "了解活动",
    href: "/membership",
    tone: "mint",
  },
  {
    id: "ad-vip-1",
    title: "清爽浏览更尽兴",
    body: "开通会员减少广告打扰，反馈还能优先处理。",
    cta: "开通会员",
    href: "/membership",
    tone: "blue",
  },
  {
    id: "ad-local-1",
    title: "同城服务优选",
    body: "维修、家政、出行——看看邻居怎么评。",
    cta: "逛一逛",
    href: "/search",
    tone: "violet",
  },
  {
    id: "ad-brand-1",
    title: "品牌联名测评",
    body: "真实用户打分，比口号更有参考价值。",
    cta: "看测评",
    href: "/",
    tone: "warm",
  },
  {
    id: "ad-event-1",
    title: "本周话题挑战",
    body: "参与议题讨论，赢取周边（演示广告）。",
    cta: "立即参与",
    href: "/announcements",
    tone: "mint",
  },
  {
    id: "ad-edu-1",
    title: "兴趣课体验券",
    body: "烘焙 / 摄影 / 编程体验课，限时领取。",
    cta: "领券",
    href: "/membership",
    tone: "violet",
  },
  {
    id: "ad-travel-1",
    title: "短途周末游",
    body: "周边好去处真实评价，出行不踩雷。",
    cta: "选路线",
    href: "/search?q=场所",
    tone: "blue",
  },
] as const;

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickAds(count: number, seed: string): AdCreative[] {
  const rand = mulberry32(hashSeed(seed));
  const pool = [...AD_CREATIVES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const out: AdCreative[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[i % pool.length]);
  }
  return out;
}

export type FeedAdEntry<T> =
  | { kind: "content"; data: T }
  | { kind: "ad"; ad: AdCreative };

/**
 * 把广告随机穿进列表：间隔 1～3 条内容插一条，开头也可能插。
 */
export function weaveAdsIntoFeed<T>(
  items: readonly T[],
  seed: string,
): FeedAdEntry<T>[] {
  const rand = mulberry32(hashSeed(`weave-${seed}`));
  const ads = pickAds(Math.max(8, items.length + 4), `pool-${seed}`);
  let adCursor = 0;
  const out: FeedAdEntry<T>[] = [];

  if (rand() < 0.55) {
    out.push({ kind: "ad", ad: ads[adCursor++] });
  }

  let sinceAd = 0;
  let nextGap = 1 + Math.floor(rand() * 3); // 1–3

  for (const item of items) {
    out.push({ kind: "content", data: item });
    sinceAd += 1;
    if (sinceAd >= nextGap) {
      out.push({ kind: "ad", ad: ads[adCursor++ % ads.length] });
      sinceAd = 0;
      nextGap = 1 + Math.floor(rand() * 3);
    }
  }

  if (rand() < 0.7) {
    out.push({ kind: "ad", ad: ads[adCursor % ads.length] });
  }

  return out;
}

export function toneClass(tone: AdCreative["tone"]): string {
  switch (tone) {
    case "warm":
      return "bg-[color-mix(in_srgb,var(--grouped-background)_82%,#f0a36b)]";
    case "mint":
      return "bg-[color-mix(in_srgb,var(--grouped-background)_82%,#6bc5a0)]";
    case "violet":
      return "bg-[color-mix(in_srgb,var(--grouped-background)_82%,#9b8cff)]";
    default:
      return "bg-[color-mix(in_srgb,var(--grouped-background)_82%,var(--system-blue))]";
  }
}
