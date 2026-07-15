"use client";

/**
 * 理解万岁 · 广告位（会员免广告）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import {
  pickAds,
  toneClass,
  type AdCreative,
} from "@/lib/data/ads";
import { useMembership } from "@/lib/hooks/useMembership";

export function AdSlot({
  seed = "default",
  compact = false,
  creative,
}: {
  seed?: string;
  compact?: boolean;
  creative?: AdCreative;
}) {
  const { showAds, ready } = useMembership();
  if (!ready || !showAds) return null;

  const ad = creative ?? pickAds(1, seed)[0];

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border border-[var(--separator)]/80 ${toneClass(ad.tone)} ${
        compact ? "p-3" : "p-4"
      }`}
      aria-label="广告"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-[var(--secondary-label)]">
          赞助内容
        </p>
        <Link
          href="/membership"
          className="text-[11px] text-[var(--secondary-label)] underline-offset-2 hover:underline"
        >
          去广告
        </Link>
      </div>
      <p
        className={`mt-1.5 font-semibold text-[var(--label)] ${
          compact ? "text-[14px]" : "text-[16px]"
        }`}
      >
        {ad.title}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--secondary-label)]">
        {ad.body}
      </p>
      <Link
        href={ad.href}
        className="mt-3 inline-flex text-[13px] font-medium text-[var(--system-blue)]"
      >
        {ad.cta} →
      </Link>
    </aside>
  );
}

/** 侧栏一次多条、顺序随机 */
export function AdStack({ seed, count = 2 }: { seed: string; count?: number }) {
  const { showAds, ready } = useMembership();
  if (!ready || !showAds) return null;
  const ads = pickAds(count, seed);
  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <AdSlot key={`${seed}-${ad.id}`} creative={ad} compact seed={seed} />
      ))}
    </div>
  );
}
