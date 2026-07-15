"use client";

/**
 * 理解万岁 · 实例列表
 * 使用 Cursor 制作
 */

import Link from "next/link";
import {
  formatScoreSummary,
  scoringModeLabel,
} from "@/lib/i18n/labels";
import type { Instance, InstanceScoreSummary } from "@/lib/types/domain";

export interface InstanceRow {
  instance: Instance;
  summary: InstanceScoreSummary | null;
}

export function InstanceList({
  rows,
  animated = true,
}: {
  rows: InstanceRow[];
  animated?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="animate-rise rounded-2xl bg-[var(--grouped-background)] px-5 py-10 text-center text-[15px] text-[var(--secondary-label)]">
        暂无实例。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map(({ instance, summary }, index) => (
        <li
          key={instance.id}
          className={animated ? "animate-rise-stagger" : undefined}
          style={
            animated
              ? { animationDelay: `${Math.min(index, 8) * 55}ms` }
              : undefined
          }
        >
          <Link
            href={`/instances/${instance.id}`}
            className="card-lift block rounded-2xl bg-[var(--grouped-background)] px-4 py-4 shadow-[0_1px_0_var(--separator)] sm:px-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[17px] font-semibold text-[var(--label)] sm:text-[19px]">
                  {instance.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-[14px] text-[var(--secondary-label)] sm:text-[15px]">
                  {instance.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] text-[var(--secondary-label)] sm:text-[12px] dark:bg-white/[0.08]">
                {scoringModeLabel(instance.scoringMode)}
              </span>
            </div>
            <p className="mt-3 text-[14px] font-medium text-[var(--system-blue)] sm:text-[15px]">
              {summary ? formatScoreSummary(summary) : "暂无数据"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
