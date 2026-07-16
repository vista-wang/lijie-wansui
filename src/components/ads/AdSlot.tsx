"use client";

/**
 * 理解万岁 · 广告位（会员免广告）
 * 使用 Cursor 制作
 *
 * 广告获取失败或无效时不渲染，避免空白/报错占位。
 */

import Link from "next/link";
import {
  adLabelText,
  pickOneAd,
  pickAds,
  toneClass,
  type AdCreative,
} from "@/lib/data/ads";
import { useMembership } from "@/lib/hooks/useMembership";

function AdCta({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http://") || href.startsWith("https://");
  const className =
    "mt-3 inline-flex text-[13px] font-medium text-[var(--system-blue)]";
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function resolveCreative(
  creative: AdCreative | undefined,
  seed: string,
): AdCreative | null {
  try {
    if (creative) {
      if (
        creative.id &&
        creative.title?.trim() &&
        creative.body?.trim() &&
        creative.cta?.trim() &&
        creative.href?.trim()
      ) {
        return creative;
      }
      return null;
    }
    return pickOneAd(seed);
  } catch {
    return null;
  }
}

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

  const ad = resolveCreative(creative, seed);
  if (!ad) return null;

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border border-[var(--separator)]/80 ${toneClass(ad.tone)} ${
        compact ? "p-3" : "p-4"
      }`}
      aria-label={adLabelText(ad)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-[var(--secondary-label)]">
          {adLabelText(ad)}
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
      <AdCta href={ad.href}>
        {ad.cta} →
      </AdCta>
    </aside>
  );
}

/** 侧栏广告；默认更少，失败则不显示 */
export function AdStack({ seed, count = 1 }: { seed: string; count?: number }) {
  const { showAds, ready } = useMembership();
  if (!ready || !showAds) return null;

  let ads: AdCreative[] = [];
  try {
    ads = pickAds(Math.max(0, count), seed);
  } catch {
    return null;
  }
  if (ads.length === 0) return null;

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <AdSlot key={`${seed}-${ad.id}`} creative={ad} compact seed={seed} />
      ))}
    </div>
  );
}
