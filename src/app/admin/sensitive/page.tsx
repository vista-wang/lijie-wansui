"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useData } from "@/components/data/DataProvider";
import { Button } from "@/components/ui/Button";
import {
  addSensitiveWordAction,
  removeSensitiveWordAction,
} from "@/lib/data/actions";
import { listSensitiveWords } from "@/lib/data/sensitive";
import { useStoreRevision } from "@/lib/data/use-store-revision";

export default function SensitiveWordsPage() {
  const { user, ready } = useAuth();
  const { ready: dataReady, refresh } = useData();
  useStoreRevision();
  const words =
    user?.role === "admin" && dataReady ? listSensitiveWords() : [];
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  if (!ready) {
    return (
      <main className="w-full py-12 text-[var(--secondary-label)]">
        加载中…
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="w-full py-12">
        <h1 className="text-[28px] font-semibold text-[var(--label)]">
          敏感词管理
        </h1>
        <p className="mt-3 text-[17px] text-[var(--secondary-label)]">
          需要管理员账号（Clerk publicMetadata.role = admin）。
        </p>
      </main>
    );
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await addSensitiveWordAction(draft);
      setDraft("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <Link
        href="/admin"
        className="text-[15px] text-[var(--system-blue)] hover:underline"
      >
        ← 管理首页
      </Link>
      <h1 className="mt-4 text-[34px] font-semibold tracking-tight text-[var(--label)]">
        敏感词打码
      </h1>
      <p className="mt-2 text-[17px] text-[var(--secondary-label)]">
        公开标题、描述与评论中命中词将被替换为「*」。原文保存在 Supabase。
      </p>

      <form onSubmit={onAdd} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-xl border border-[var(--separator)] bg-[var(--grouped-background)] px-3 text-[17px] text-[var(--label)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="输入敏感词"
        />
        <Button type="submit">添加</Button>
      </form>
      {error && (
        <p className="mt-2 text-[15px] text-red-600 dark:text-red-400">{error}</p>
      )}

      <ul className="mt-8 space-y-2">
        {words.map((word) => (
          <li
            key={word}
            className="flex items-center justify-between rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
          >
            <span className="font-mono text-[16px] text-[var(--label)]">
              {word}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                await removeSensitiveWordAction(word);
                await refresh();
              }}
            >
              移除
            </Button>
          </li>
        ))}
        {words.length === 0 && (
          <li className="text-[15px] text-[var(--secondary-label)]">
            暂无敏感词。
          </li>
        )}
      </ul>
    </main>
  );
}
