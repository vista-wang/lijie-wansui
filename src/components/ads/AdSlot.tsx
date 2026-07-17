"use client";

/**
 * 理解万岁 · 左上角广告位（仅 AIW；会员免广告时隐藏）
 * 使用 Cursor 制作
 */

import {
  AIW_AD,
  adLabelText,
  toneClass,
} from "@/lib/data/ads";
import { useMembership } from "@/lib/hooks/useMembership";

function AdCta({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    "mt-3 inline-flex text-[13px] font-medium text-[var(--system-blue)]";
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

/** 仅左上角使用；其它页面勿再挂广告位 */
export function AiwAdSlot({ compact = true }: { compact?: boolean }) {
  const { showAds, ready } = useMembership();
  if (!ready || !showAds) return null;

  const ad = AIW_AD;

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border border-[var(--separator)]/80 ${toneClass(ad.tone)} ${
        compact ? "p-3" : "p-4"
      }`}
      aria-label={adLabelText(ad)}
    >
      <p className="text-[11px] font-medium text-[var(--secondary-label)]">
        {adLabelText(ad)}
      </p>
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
