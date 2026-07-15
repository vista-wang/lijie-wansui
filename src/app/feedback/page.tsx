"use client";

/**
 * 理解万岁 · 用户反馈
 * 使用 Cursor 制作
 */

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  listMyFeedbacks,
  membershipLabel,
  submitFeedback,
} from "@/lib/data/membership";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { useMembership } from "@/lib/hooks/useMembership";
import { formatDateTime } from "@/lib/i18n/labels";

export default function FeedbackPage() {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const { tier, label } = useMembership();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const mine = ready && user ? listMyFeedbacks(user.id) : [];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!user) {
      setError("请先登录后再提交反馈。");
      return;
    }
    try {
      submitFeedback(user.id, body);
      setBody("");
      setMessage(
        tier === "free"
          ? "已收到，我们会按顺序查看。"
          : `已收到，你的${membershipLabel(tier)}反馈会优先处理。`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    }
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        意见反馈
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        告诉我们哪里不好用、想要什么功能。
        {ready && user ? (
          <>
            {" "}
            当前身份：{label}。
            {tier === "free" && (
              <Link href="/membership" className="text-[var(--system-blue)]">
                开通会员可提高处理优先级
              </Link>
            )}
          </>
        ) : null}
      </p>

      <form onSubmit={onSubmit} className="mt-8">
        <textarea
          className="w-full min-h-32 resize-y rounded-2xl border border-[var(--separator)] bg-[var(--grouped-background)] px-4 py-3 text-[17px] text-[var(--label)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]"
          placeholder="例如：希望能按城市筛选…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" className="mt-4">
          提交反馈
        </Button>
      </form>

      {(message || error) && (
        <p
          className={`mt-4 text-[15px] ${
            error
              ? "text-red-600 dark:text-red-400"
              : "text-[var(--system-blue)]"
          }`}
        >
          {error || message}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">
          我提交过的
        </h2>
        <ul className="mt-4 space-y-3">
          {mine.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
            >
              <p className="text-[15px] text-[var(--label)]">{item.body}</p>
              <p className="mt-2 text-[12px] text-[var(--secondary-label)]">
                {formatDateTime(item.createdAt)} ·{" "}
                {item.status === "done" ? "已处理" : "处理中"}
              </p>
            </li>
          ))}
          {user && mine.length === 0 && (
            <li className="text-[15px] text-[var(--secondary-label)]">
              还没有反馈记录。
            </li>
          )}
          {!user && (
            <li className="text-[15px] text-[var(--secondary-label)]">
              登录后可查看你的反馈历史。
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
