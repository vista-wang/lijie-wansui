"use client";

/**
 * 理解万岁 · 管理端反馈
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { findMockUser } from "@/lib/auth/mock-users";
import {
  listFeedbacksForAdmin,
  markFeedbackDone,
} from "@/lib/data/membership";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { formatDateTime } from "@/lib/i18n/labels";

function AdminFeedbackContent() {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const kind = searchParams.get("kind") === "plus" ? "plus" : "normal";

  if (!ready) {
    return (
      <main className="w-full py-12 text-[var(--secondary-label)]">加载中…</main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="w-full py-12">
        <h1 className="text-[28px] font-semibold text-[var(--label)]">反馈</h1>
        <p className="mt-3 text-[15px] text-[var(--secondary-label)]">
          需要管理员账号。请到「账号」切换为李明。
        </p>
      </main>
    );
  }

  const list = listFeedbacksForAdmin(kind);

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        {kind === "plus" ? "高级反馈" : "反馈"}
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)]">
        {kind === "plus"
          ? "来自高级 / 超级会员的反馈，按优先级排列。"
          : "普通用户反馈。"}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/feedback"
          className={`rounded-xl px-3 py-2 text-[14px] ${
            kind === "normal"
              ? "bg-[var(--system-blue)] text-white"
              : "bg-black/[0.06] text-[var(--label)] dark:bg-white/[0.1]"
          }`}
        >
          反馈
        </Link>
        <Link
          href="/admin/feedback?kind=plus"
          className={`rounded-xl px-3 py-2 text-[14px] ${
            kind === "plus"
              ? "bg-[var(--system-blue)] text-white"
              : "bg-black/[0.06] text-[var(--label)] dark:bg-white/[0.1]"
          }`}
        >
          高级反馈
        </Link>
      </div>

      <ul className="mt-8 space-y-3">
        {list.map((item) => {
          const author = findMockUser(item.authorId);
          return (
            <li
              key={item.id}
              className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[16px] font-medium text-[var(--label)]">
                  {author?.displayName ?? item.authorId}
                </p>
                <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] text-[var(--secondary-label)] dark:bg-white/[0.08]">
                  {item.priority === "super"
                    ? "超级优先"
                    : item.priority === "plus"
                      ? "高级优先"
                      : "普通"}
                </span>
                <span className="text-[12px] text-[var(--secondary-label)]">
                  {item.status === "done" ? "已处理" : "待处理"}
                </span>
              </div>
              <p className="mt-2 text-[15px] text-[var(--label)]">{item.body}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <time className="text-[12px] text-[var(--secondary-label)]">
                  {formatDateTime(item.createdAt)}
                </time>
                {item.status === "open" && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => markFeedbackDone(item.id)}
                  >
                    标为已处理
                  </Button>
                )}
              </div>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="text-[15px] text-[var(--secondary-label)]">
            当前分类暂无反馈。
          </li>
        )}
      </ul>
    </main>
  );
}

export default function AdminFeedbackPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full py-12 text-[var(--secondary-label)]">加载中…</main>
      }
    >
      <AdminFeedbackContent />
    </Suspense>
  );
}
