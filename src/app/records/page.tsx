"use client";

import Link from "next/link";
import { AdSlot, AdStack } from "@/components/ads/AdSlot";
import { useAuth } from "@/components/auth/AuthProvider";
import { listMyRecords } from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { formatDateTime } from "@/lib/i18n/labels";

export default function RecordsPage() {
  const { user } = useAuth();
  useStoreRevision();
  const records = user ? listMyRecords(user.id) : [];

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        我的足迹
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        你点评过、留言过的内容都在这里。
      </p>

      <div className="mt-6">
        <AdSlot seed="records-top" />
      </div>

      {!user && (
        <p className="mt-10 rounded-2xl bg-[var(--grouped-background)] px-5 py-8 text-[15px] text-[var(--secondary-label)]">
          请先到「账号」登录后查看记录。
        </p>
      )}

      {user && (
        <ul className="mt-8 space-y-3">
          {records.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Link
                href={`/instances/${item.instanceId}`}
                className="block rounded-2xl bg-[var(--grouped-background)] px-4 py-4 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[var(--system-blue)]">
                    {item.kind === "rating" ? "评分" : "评论"}
                  </span>
                  <time className="text-[12px] text-[var(--secondary-label)]">
                    {formatDateTime(item.at)}
                  </time>
                </div>
                <p className="mt-1 text-[17px] font-semibold text-[var(--label)]">
                  {item.instanceTitle}
                </p>
                <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
                  {item.detail}
                </p>
              </Link>
            </li>
          ))}
          {records.length === 0 && (
            <li className="rounded-2xl bg-[var(--grouped-background)] px-5 py-8 text-[15px] text-[var(--secondary-label)]">
              暂无记录。
            </li>
          )}
        </ul>
      )}

      <div className="mt-8">
        <AdStack seed="records-bottom" count={2} />
      </div>
    </main>
  );
}
