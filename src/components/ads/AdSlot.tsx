"use client";

/**
 * 理解万岁 · 左上角广告位（会员免广告；Lemon Squeezy + AIW）
 * 使用 Cursor 制作
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AIW_AD,
  adLabelText,
  toneClass,
  type AdCreative,
} from "@/lib/data/ads";
import { useMembership } from "@/lib/hooks/useMembership";

function AdCta({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    "mt-3 inline-flex text-[13px] font-medium text-[var(--system-blue)]";
  const external = href.startsWith("http://") || href.startsWith("https://");
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

function AdCard({ ad, compact }: { ad: AdCreative; compact: boolean }) {
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

/** 左上角：受会员免广告影响；优先 Lemon Squeezy，失败回退 AIW */
export function AiwAdSlot({ compact = true }: { compact?: boolean }) {
  const { showAds, ready } = useMembership();
  const [ad, setAd] = useState<AdCreative | null>(AIW_AD);

  useEffect(() => {
    if (!ready || !showAds) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/ads", { cache: "no-store" });
        if (!res.ok) throw new Error("ads_failed");
        const json = (await res.json()) as { ads?: AdCreative[] };
        const list = (json.ads ?? []).filter(
          (item) =>
            item?.id &&
            item.title?.trim() &&
            item.body?.trim() &&
            item.href?.trim(),
        );
        if (!cancelled) {
          setAd(list[0] ?? AIW_AD);
        }
      } catch {
        if (!cancelled) setAd(AIW_AD);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, showAds]);

  if (!ready || !showAds || !ad) return null;

  return <AdCard ad={ad} compact={compact} />;
}
