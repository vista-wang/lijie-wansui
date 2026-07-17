"use client";

/**
 * 理解万岁 · 会员专属身份徽章
 * 使用 Cursor 制作
 */

import type { MembershipTier } from "@/lib/types/membership";

export function MembershipBadge({
  tier,
  compact = false,
}: {
  tier: MembershipTier;
  compact?: boolean;
}) {
  if (tier !== "plus" && tier !== "super") return null;

  const isSuper = tier === "super";
  const label = isSuper ? "超级会员" : "高级会员";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        compact
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-1 text-[12px] sm:text-[13px]"
      } ${
        isSuper
          ? "bg-[color-mix(in_srgb,var(--system-blue)_12%,#f5a623)] text-[var(--label)] ring-1 ring-[color-mix(in_srgb,#f5a623_45%,transparent)]"
          : "bg-[var(--system-blue)]/12 text-[var(--system-blue)] ring-1 ring-[var(--system-blue)]/25"
      }`}
      title={`${label}专属身份徽章`}
      aria-label={`${label}专属身份徽章`}
    >
      <span aria-hidden className={compact ? "text-[10px]" : "text-[12px]"}>
        {isSuper ? "✦" : "◆"}
      </span>
      <span>{compact ? (isSuper ? "超级" : "高级") : `${label}徽章`}</span>
    </span>
  );
}
