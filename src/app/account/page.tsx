"use client";

/**
 * 理解万岁 · 账号页（Clerk 登录 / 强制实名）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { setRealNameAction } from "@/lib/auth/actions";
import {
  PRIVACY_AGREE_HINT,
  REAL_NAME_HINT,
  REAL_NAME_REQUIRED,
  REAL_NAME_TAKEN_HINT,
  SUPPORT_EMAIL,
} from "@/lib/auth/messages";
import { MembershipBadge } from "@/components/membership/MembershipBadge";
import { useMembership } from "@/lib/hooks/useMembership";

export default function AccountPage() {
  const { user, hasRealName, signOut, ready } = useAuth();
  const { user: clerkUser } = useUser();
  const { tier, label } = useMembership();
  const isAdmin = user?.role === "admin";

  const [realName, setRealName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSaveRealName(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await setRealNameAction(realName);
      await clerkUser?.reload();
      setMessage("真实姓名已保存，现在可以正常使用");
      setRealName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        我的账号
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        管理登录与实名信息。一人一账号，须使用真实姓名。
      </p>

      <section className="mt-8 rounded-2xl bg-[var(--grouped-background)] p-5">
        <p className="text-[13px] font-medium text-[var(--secondary-label)]">
          当前身份
        </p>
        <p className="mt-2 text-[20px] font-semibold text-[var(--label)]">
          {ready ? (user ? user.displayName : "未登录") : "加载中…"}
        </p>
        {user && (
          <>
            <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
              {user.email}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="inline-flex rounded-full bg-[var(--system-blue)]/10 px-3 py-1 text-[13px] font-medium text-[var(--system-blue)]">
                {label}
                {isAdmin ? " · 管理员" : ""}
              </p>
              <MembershipBadge tier={tier} />
            </div>
            {!hasRealName && (
              <p className="mt-3 text-[14px] font-medium text-red-600 dark:text-red-400">
                {REAL_NAME_REQUIRED}
              </p>
            )}
          </>
        )}
      </section>

      {!user && ready && (
        <section className="mt-8 rounded-2xl bg-[var(--grouped-background)] p-5">
          <p className="text-[15px] leading-relaxed text-[var(--secondary-label)]">
            {REAL_NAME_HINT}。注册后须立即完成实名登记，否则无法评分、留言或发布。
            若真实姓名已被占用，请发邮件至{" "}
            <a
              className="text-[var(--system-blue)] underline-offset-2 hover:underline"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            证明身份。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <SignInButton mode="modal">
              <Button type="button">登录</Button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/account">
              <Button type="button" variant="secondary">
                注册
              </Button>
            </SignUpButton>
          </div>
          <p className="mt-4 text-[12px] text-[var(--secondary-label)]">
            {PRIVACY_AGREE_HINT}（
            <Link href="/privacy" className="text-[var(--system-blue)]">
              查看全文
            </Link>
            ）。
          </p>
        </section>
      )}

      {user && (
        <section className="mt-8 rounded-2xl bg-[var(--grouped-background)] p-5">
          <h2 className="text-[17px] font-semibold text-[var(--label)]">
            真实姓名
          </h2>
          {hasRealName ? (
            <p className="mt-2 text-[15px] text-[var(--label)]">
              已登记。如需更正请联系{" "}
              <a
                className="text-[var(--system-blue)] underline-offset-2 hover:underline"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              。
            </p>
          ) : (
            <>
              <p className="mt-1 text-[13px] font-medium text-[var(--system-blue)]">
                {REAL_NAME_HINT}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--secondary-label)]">
                {REAL_NAME_TAKEN_HINT}
              </p>
              <form className="mt-4 space-y-3" onSubmit={onSaveRealName}>
                <input
                  required
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--separator)] bg-[var(--background)] px-3 py-3 text-[16px] text-[var(--label)] outline-none focus:border-[var(--system-blue)]"
                  placeholder="与证件一致的姓名"
                  autoComplete="name"
                />
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? "保存中…" : "保存真实姓名"}
                </Button>
              </form>
            </>
          )}
          {(error || message) && (
            <p
              className={`mt-3 text-[14px] ${
                error
                  ? "text-red-600 dark:text-red-400"
                  : "text-[var(--system-blue)]"
              }`}
            >
              {error || message}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => void signOut()}
          >
            退出登录
          </Button>
        </section>
      )}

      {user && (
        <section className="mt-6">
          <Link
            href="/feedback"
            className="block rounded-2xl bg-[var(--grouped-background)] px-4 py-4 text-[15px] font-medium text-[var(--label)]"
          >
            意见反馈
          </Link>
        </section>
      )}

      {isAdmin && (
        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[var(--label)]">
            管理后台
          </h2>
          <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
            仅管理员可见。
          </p>
          <Link
            href="/admin"
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
          >
            进入管理
          </Link>
        </section>
      )}
    </main>
  );
}
