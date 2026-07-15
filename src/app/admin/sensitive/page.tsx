"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  addSensitiveWord,
  listSensitiveWords,
  removeSensitiveWord,
} from "@/lib/data/sensitive";
import { useStoreRevision } from "@/lib/data/use-store-revision";

export default function SensitiveWordsPage() {
  const { user, ready } = useAuth();
  useStoreRevision();
  const words = user?.role === "admin" ? listSensitiveWords() : [];
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

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
        <h1 className="text-[28px] font-semibold text-[var(--label)]">
          敏感词管理
        </h1>
        <p className="mt-3 text-[17px] text-[var(--secondary-label)]">
          需要管理员账号。
        </p>
      </main>
    );
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      addSensitiveWord(draft);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
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
        公开标题、描述与评论中命中词将被替换为等长「*」。原文仍保存在本地存储中。
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
              onClick={() => removeSensitiveWord(word)}
            >
              移除
            </Button>
          </li>
        ))}
        {words.length === 0 && (
          <li className="text-[15px] text-[var(--secondary-label)]">
            词库为空。
          </li>
        )}
      </ul>
    </main>
  );
}
