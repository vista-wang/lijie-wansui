"use client";

/**
 * 理解万岁 · 广告位（会员免广告）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useMembership } from "@/lib/hooks/useMembership";

export function AdSlot({
  placement = "banner",
}: {
  placement?: "banner" | "sidebar" | "feed";
}) {
  const { showAds, ready } = useMembership();
  if (!ready || !showAds) return null;

  const compact = placement === "sidebar";

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border border-dashed border-[var(--separator)] bg-[color-mix(in_srgb,var(--grouped-background)_88%,var(--system-blue))] ${
        compact ? "p-3" : "p-4"
      }`}
      aria-label="广告"
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--secondary-label)]">
        广告
      </p>
      <p
        className={`mt-1 font-semibold text-[var(--label)] ${
          compact ? "text-[14px]" : "text-[16px]"
        }`}
      >
        {placement === "feed"
          ? "发现更多好去处"
          : "本地生活精选合作"}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--secondary-label)]">
        演示广告位。开通会员后可关闭此类展示。
      </p>
      <Link
        href="/membership"
        className="mt-3 inline-flex text-[13px] font-medium text-[var(--system-blue)]"
      >
        去广告 · 了解会员
      </Link>
    </aside>
  );
}
