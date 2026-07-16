"use client";

/**
 * 理解万岁 · 管理端发公告
 * 使用 Cursor 制作
 */

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { createAnnouncement, listAnnouncements } from "@/lib/data/membership";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { formatDateTime } from "@/lib/i18n/labels";

export default function AdminAnnouncementsPage() {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [superOnly, setSuperOnly] = useState(false);
  const [message, setMessage] = useState("");

  if (!ready) {
    return (
      <main className="w-full py-12 text-[var(--secondary-label)]">加载中…</main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="w-full py-12">
        <h1 className="text-[28px] font-semibold text-[var(--label)]">公告管理</h1>
        <p className="mt-3 text-[15px] text-[var(--secondary-label)]">
          需要管理员账号。
        </p>
      </main>
    );
  }

  const list = listAnnouncements(user.id);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setMessage("请填写标题和正文");
      return;
    }
    createAnnouncement({ title, body, superOnly });
    setTitle("");
    setBody("");
    setSuperOnly(false);
    setMessage("公告已发布");
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        公告管理
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)]">
        发布全站公告，或仅超级会员可见的「与开发者交流」内容。
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          className="w-full min-h-12 rounded-xl border border-[var(--separator)] bg-[var(--grouped-background)] px-3 text-[17px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]"
          placeholder="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full min-h-28 resize-y rounded-xl border border-[var(--separator)] bg-[var(--grouped-background)] px-3 py-3 text-[17px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]"
          placeholder="正文"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <label className="flex items-center gap-2 text-[15px] text-[var(--label)]">
          <input
            type="checkbox"
            checked={superOnly}
            onChange={(e) => setSuperOnly(e.target.checked)}
          />
          与开发者交流（仅超级会员可见）
        </label>
        <Button type="submit">发布</Button>
      </form>
      {message && (
        <p className="mt-3 text-[15px] text-[var(--system-blue)]">{message}</p>
      )}

      <ul className="mt-10 space-y-3">
        {list.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
          >
            <p className="font-semibold text-[var(--label)]">
              {item.title}
              {item.superOnly ? " · 与开发者交流" : ""}
            </p>
            <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
              {item.body}
            </p>
            <p className="mt-2 text-[12px] text-[var(--secondary-label)]">
              {formatDateTime(item.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
