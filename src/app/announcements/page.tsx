"use client";

/**
 * 理解万岁 · 公告
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useData } from "@/components/data/DataProvider";
import { listAnnouncements } from "@/lib/data/membership";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { useMembership } from "@/lib/hooks/useMembership";
import { formatDateTime } from "@/lib/i18n/labels";

export default function AnnouncementsPage() {
  const ready = useClientReady();
  const { ready: dataReady } = useData();
  useStoreRevision();
  const { user } = useAuth();
  const { tier } = useMembership();

  const list =
    ready && dataReady ? listAnnouncements(user?.id ?? null, tier) : [];

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        公告
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        产品动态与活动通知。
        {tier !== "super" && (
          <>
            {" "}
            <Link href="/membership" className="text-[var(--system-blue)]">
              超级会员
            </Link>
            还可与开发者交流。
          </>
        )}
      </p>

      <ul className="mt-8 space-y-3">
        {list.map((item) => (
          <li
            key={item.id}
            className="animate-rise rounded-2xl bg-[var(--grouped-background)] px-5 py-4 shadow-[0_1px_0_var(--separator)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[18px] font-semibold text-[var(--label)]">
                {item.title}
              </h2>
              {item.superOnly && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                  与开发者交流
                </span>
              )}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--secondary-label)]">
              {item.body}
            </p>
            <p className="mt-3 text-[12px] text-[var(--secondary-label)]">
              {formatDateTime(item.createdAt)}
            </p>
          </li>
        ))}
        {ready && list.length === 0 && (
          <li className="text-[15px] text-[var(--secondary-label)]">
            暂时没有公告。
          </li>
        )}
      </ul>
    </main>
  );
}
