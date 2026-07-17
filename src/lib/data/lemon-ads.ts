/**
 * 理解万岁 · Lemon Squeezy 广告源
 * 使用 Cursor 制作
 */

import { AIW_AD, type AdCreative } from "@/lib/data/ads";

type LemonProduct = {
  id: string;
  attributes: {
    name: string;
    description: string | null;
    status: string;
    buy_now_url: string;
    price_formatted?: string;
  };
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchLemonSqueezyAds(): Promise<AdCreative[]> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) return [];

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const url = new URL("https://api.lemonsqueezy.com/v1/products");
  url.searchParams.set("filter[status]", "published");
  if (storeId) url.searchParams.set("filter[store_id]", storeId);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("Lemon Squeezy products failed", res.status);
    return [];
  }

  const json = (await res.json()) as { data?: LemonProduct[] };
  const products = json.data ?? [];
  const tones: AdCreative["tone"][] = ["blue", "warm", "mint", "violet"];

  return products.slice(0, 8).map((p, index) => {
    const desc = p.attributes.description
      ? stripHtml(p.attributes.description).slice(0, 80)
      : p.attributes.price_formatted
        ? `现价 ${p.attributes.price_formatted}`
        : "查看详情并购买";
    return {
      id: `ls-${p.id}`,
      title: p.attributes.name,
      body: desc || "来自 Lemon Squeezy 的精选产品",
      cta: "去看看",
      href: p.attributes.buy_now_url,
      tone: tones[index % tones.length],
      label: "sponsor" as const,
    };
  });
}

/** 广告池：Lemon Squeezy 产品优先，AIW 兜底；均受会员免广告影响 */
export async function buildAdInventory(): Promise<AdCreative[]> {
  try {
    const lemon = await fetchLemonSqueezyAds();
    if (lemon.length > 0) return [...lemon, AIW_AD];
    return [AIW_AD];
  } catch (e) {
    console.error(e);
    return [AIW_AD];
  }
}
