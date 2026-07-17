/**
 * 理解万岁 · 广告类型与 AIW 兜底
 * 使用 Cursor 制作
 */

export type AdLabel = "sponsor" | "same_author";

export type AdCreative = {
  id: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "blue" | "warm" | "mint" | "violet";
  label?: AdLabel;
};

/** AIWriter：同作者产品；受会员免广告影响 */
export const AIW_AD: AdCreative = {
  id: "ad-aiwriter",
  title: "AIWriter · AI 小说写作",
  body: "网页端 AI 小说写作框架，从构思到成章一站式开写。使用 Cursor 制作。",
  cta: "立即体验",
  href: "https://aiw.ethan128.top",
  tone: "blue",
  label: "same_author",
};

export function adLabelText(ad: AdCreative): string {
  if (ad.label === "same_author") return "同作者产品";
  return "赞助内容";
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
