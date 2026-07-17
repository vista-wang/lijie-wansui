"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useData } from "@/components/data/DataProvider";
import { findProfileName } from "@/lib/data/store";
import { listAuditEvents, listInstances } from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { auditActionLabel, formatDateTime } from "@/lib/i18n/labels";
import type { AuditEvent } from "@/lib/types/domain";

export default function AdminPage() {
  const { user, ready } = useAuth();
  const { ready: dataReady } = useData();
  useStoreRevision();
  const events = user?.role === "admin" && dataReady ? listAuditEvents() : [];
  const instances = user?.role === "admin" && dataReady ? listInstances() : [];

  if (!ready || !dataReady) {
    return (
      <main className="w-full py-12 text-[var(--secondary-label)]">
        加载中…
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="w-full py-12">
        <h1 className="text-[28px] font-semibold text-[var(--label)]">管理</h1>
        <p className="mt-3 text-[17px] text-[var(--secondary-label)]">
          需要管理员账号。
        </p>
      </main>
    );
  }

  function entityTitle(event: AuditEvent): string {
    if (event.entityType === "instance") {
      return (
        instances.find((i) => i.id === event.entityId)?.title ?? event.entityId
      );
    }
    return event.entityId;
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        管理
      </h1>
      <p className="mt-2 text-[17px] text-[var(--secondary-label)]">
        实名审计与敏感词配置。公开端不会显示操作者姓名。
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/feedback"
          className="inline-flex min-h-11 items-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
        >
          反馈
        </Link>
        <Link
          href="/admin/announcements"
          className="inline-flex min-h-11 items-center rounded-xl bg-black/[0.06] px-4 text-[15px] font-medium text-[var(--label)] dark:bg-white/[0.1]"
        >
          公告管理
        </Link>
        <Link
          href="/admin/sensitive"
          className="inline-flex min-h-11 items-center rounded-xl bg-black/[0.06] px-4 text-[15px] font-medium text-[var(--label)] dark:bg-white/[0.1]"
        >
          敏感词
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">
          实名审计
        </h2>
        <ul className="mt-4 space-y-2">
          {events.map((event) => {
            const actorName = findProfileName(event.actorId);
            return (
              <li
                key={event.id}
                className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[16px] font-medium text-[var(--label)]">
                    {actorName ?? event.actorId}
                    <span className="mx-2 font-normal text-[var(--secondary-label)]">
                      ·
                    </span>
                    {auditActionLabel(event.action)}
                  </p>
                  <time className="text-[12px] text-[var(--secondary-label)]">
                    {formatDateTime(event.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-[13px] text-[var(--secondary-label)]">
                  {event.entityType === "instance"
                    ? "实例"
                    : event.entityType === "rating"
                      ? "评分"
                      : "评论"}
                  ：{entityTitle(event)}
                  {event.payload?.score != null
                    ? ` · 分数 ${String(event.payload.score)}`
                    : ""}
                </p>
              </li>
            );
          })}
          {events.length === 0 && (
            <li className="text-[15px] text-[var(--secondary-label)]">
              暂无审计记录。
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
