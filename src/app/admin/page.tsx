"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { findMockUser } from "@/lib/auth/mock-users";
import { listAuditEvents, listInstances } from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { auditActionLabel, formatDateTime } from "@/lib/i18n/labels";
import type { AuditEvent } from "@/lib/types/domain";

export default function AdminPage() {
  const { user, ready } = useAuth();
  useStoreRevision();
  const events = user?.role === "admin" ? listAuditEvents() : [];
  const instances = user?.role === "admin" ? listInstances() : [];

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-[var(--secondary-label)]">
        加载中…
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-[28px] font-semibold text-[var(--label)]">管理</h1>
        <p className="mt-3 text-[17px] text-[var(--secondary-label)]">
          需要管理员账号。请到「账号」切换为李明后进入。
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        管理
      </h1>
      <p className="mt-2 text-[17px] text-[var(--secondary-label)]">
        实名审计与敏感词配置。公开端不会显示操作者姓名。
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/sensitive"
          className="inline-flex min-h-11 items-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
        >
          敏感词管理
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">
          实名审计
        </h2>
        <ul className="mt-4 space-y-2">
          {events.map((event) => {
            const actor = findMockUser(event.actorId);
            return (
              <li
                key={event.id}
                className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[16px] font-medium text-[var(--label)]">
                    {actor?.displayName ?? event.actorId}
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
