/**
 * 理解万岁 · 广告库存与随机穿插
 * 使用 Cursor 制作
 *
 * 位置不固定：按种子在信息流中间隔插入，侧栏/页内多处投放。
 * 获取失败时返回空，调用方不渲染。
 */

export type AdLabel = "sponsor" | "same_author";

export type AdCreative = {
  id: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "blue" | "warm" | "mint" | "violet";
  /** 角标文案类型；默认赞助 */
  label?: AdLabel;
};

export const AD_CREATIVES: readonly AdCreative[] = [
  {
    id: "ad-aiwriter",
    title: "AIWriter · AI 小说写作",
    body: "网页端 AI 小说写作框架，从构思到成章一站式开写。使用 Cursor 制作。",
    cta: "立即体验",
    href: "https://aiw.ethan128.top",
    tone: "blue",
    label: "same_author",
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
    id: "ad-travel-1",
    title: "短途周末游",
    body: "周边好去处真实评价，出行不踩雷。",
    cta: "选路线",
    href: "/search?q=场所",
    tone: "mint",
  },
] as const;

/** 站内自带合作广告，始终进入投放池首位 */
export const PINNED_AD_IDS = ["ad-aiwriter"] as const;

export function adLabelText(ad: AdCreative): string {
  if (ad.label === "same_author") return "同作者产品";
  return "赞助内容";
}

function isValidCreative(ad: AdCreative | null | undefined): ad is AdCreative {
  if (!ad) return false;
  return Boolean(
    ad.id &&
      ad.title?.trim() &&
      ad.body?.trim() &&
      ad.cta?.trim() &&
      ad.href?.trim(),
  );
}

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

/**
 * 安全取广告：库存异常或条数为 0 时返回空数组（不抛错）。
 */
export function pickAds(count: number, seed: string): AdCreative[] {
  try {
    if (count <= 0) return [];
    const rand = mulberry32(hashSeed(seed));
    const pinned = AD_CREATIVES.filter(
      (ad) =>
        (PINNED_AD_IDS as readonly string[]).includes(ad.id) &&
        isValidCreative(ad),
    );
    const pool = AD_CREATIVES.filter(
      (ad) =>
        !(PINNED_AD_IDS as readonly string[]).includes(ad.id) &&
        isValidCreative(ad),
    );
    if (pinned.length + pool.length === 0) return [];

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const ordered = [...pinned, ...pool];
    const out: AdCreative[] = [];
    for (let i = 0; i < count; i++) {
      const ad = ordered[i % ordered.length];
      if (isValidCreative(ad)) out.push(ad);
    }
    return out;
  } catch {
    return [];
  }
}

export function pickOneAd(seed: string): AdCreative | null {
  const list = pickAds(1, seed);
  return list[0] ?? null;
}

export type FeedAdEntry<T> =
  | { kind: "content"; data: T }
  | { kind: "ad"; ad: AdCreative };

/**
 * 把广告穿进列表：间隔更大、出现更少；失败则只返回内容。
 */
export function weaveAdsIntoFeed<T>(
  items: readonly T[],
  seed: string,
): FeedAdEntry<T>[] {
  try {
    const rand = mulberry32(hashSeed(`weave-${seed}`));
    const maxAds = Math.max(1, Math.ceil(items.length / 4));
    const ads = pickAds(maxAds, `pool-${seed}`);
    if (ads.length === 0) {
      return items.map((data) => ({ kind: "content" as const, data }));
    }

    let adCursor = 0;
    const out: FeedAdEntry<T>[] = [];

    // 开头较少插入
    if (rand() < 0.22 && ads[adCursor]) {
      out.push({ kind: "ad", ad: ads[adCursor++] });
    }

    let sinceAd = 0;
    let nextGap = 3 + Math.floor(rand() * 3); // 3–5 条内容插一条

    for (const item of items) {
      out.push({ kind: "content", data: item });
      sinceAd += 1;
      if (sinceAd >= nextGap && adCursor < ads.length) {
        const ad = ads[adCursor++];
        if (isValidCreative(ad)) {
          out.push({ kind: "ad", ad });
        }
        sinceAd = 0;
        nextGap = 3 + Math.floor(rand() * 3);
      }
    }

    // 末尾较少插入
    if (rand() < 0.28 && adCursor < ads.length && isValidCreative(ads[adCursor])) {
      out.push({ kind: "ad", ad: ads[adCursor] });
    }

    return out;
  } catch {
    return items.map((data) => ({ kind: "content" as const, data }));
  }
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
