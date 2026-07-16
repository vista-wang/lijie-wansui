"use client";

/**
 * 理解万岁 · 账号页（登录 / 注册）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  REAL_NAME_HINT,
  REAL_NAME_TAKEN_HINT,
  SUPPORT_EMAIL,
} from "@/lib/auth/messages";
import { useMembership } from "@/lib/hooks/useMembership";

type Mode = "login" | "register";

export default function AccountPage() {
  const { user, signIn, signUp, signOut, ready, configured } = useAuth();
  const { tier, label } = useMembership();
  const isAdmin = user?.role === "admin";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        setMessage("登录成功");
      } else {
        const result = await signUp({ email, password, realName });
        if (result.needsEmailConfirm) {
          setMessage("注册成功。请查收邮箱完成验证后再登录。");
        } else {
          setMessage("注册并登录成功");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
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
        管理登录与会员权益。一人一账号，请使用真实姓名注册。
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
            <p className="mt-3 inline-flex rounded-full bg-[var(--system-blue)]/10 px-3 py-1 text-[13px] font-medium text-[var(--system-blue)]">
              {label}
              {tier === "super" ? " · 专属徽章" : ""}
            </p>
          </>
        )}
      </section>

      {!user && (
        <section className="mt-8 rounded-2xl bg-[var(--grouped-background)] p-5">
          {!configured && (
            <p className="mb-4 text-[14px] text-red-600 dark:text-red-400">
              未检测到 Supabase 环境变量，请配置
              NEXT_PUBLIC_SUPABASE_URL 与
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className={`min-h-10 flex-1 rounded-xl text-[15px] font-medium ${
                mode === "login"
                  ? "bg-[var(--system-blue)] text-white"
                  : "bg-black/[0.06] text-[var(--label)] dark:bg-white/[0.1]"
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
              className={`min-h-10 flex-1 rounded-xl text-[15px] font-medium ${
                mode === "register"
                  ? "bg-[var(--system-blue)] text-white"
                  : "bg-black/[0.06] text-[var(--label)] dark:bg-white/[0.1]"
              }`}
            >
              注册
            </button>
          </div>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <label className="block">
                <span className="text-[13px] font-medium text-[var(--secondary-label)]">
                  真实姓名
                </span>
                <input
                  required
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--separator)] bg-[var(--background)] px-3 py-3 text-[16px] text-[var(--label)] outline-none focus:border-[var(--system-blue)]"
                  placeholder="与证件一致的姓名"
                  autoComplete="name"
                />
                <span className="mt-1.5 block text-[13px] font-medium text-[var(--system-blue)]">
                  {REAL_NAME_HINT}
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-[var(--secondary-label)]">
                  {REAL_NAME_TAKEN_HINT}
                </span>
              </label>
            )}

            <label className="block">
              <span className="text-[13px] font-medium text-[var(--secondary-label)]">
                邮箱
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--separator)] bg-[var(--background)] px-3 py-3 text-[16px] text-[var(--label)] outline-none focus:border-[var(--system-blue)]"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-[var(--secondary-label)]">
                密码
              </span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--separator)] bg-[var(--background)] px-3 py-3 text-[16px] text-[var(--label)] outline-none focus:border-[var(--system-blue)]"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </label>

            {mode === "login" && (
              <p className="text-[12px] leading-relaxed text-[var(--secondary-label)]">
                {REAL_NAME_HINT}。一人一账号。
                若发现真实姓名被占用，请发邮件至{" "}
                <a
                  className="text-[var(--system-blue)] underline-offset-2 hover:underline"
                  href={`mailto:${SUPPORT_EMAIL}`}
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                证明身份。
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={busy || !configured}
            >
              {busy
                ? "请稍候…"
                : mode === "login"
                  ? "登录"
                  : "注册"}
            </Button>
          </form>

          {(error || message) && (
            <p
              className={`mt-4 text-[14px] ${
                error
                  ? "text-red-600 dark:text-red-400"
                  : "text-[var(--system-blue)]"
              }`}
            >
              {error || message}
            </p>
          )}
        </section>
      )}

      {user && (
        <section className="mt-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => void signOut()}
          >
            退出登录
          </Button>
        </section>
      )}

      <section className="mt-6 grid gap-2 sm:grid-cols-2">
        <Link
          href="/membership"
          className="rounded-2xl bg-[var(--grouped-background)] px-4 py-4 text-[15px] font-medium text-[var(--label)]"
        >
          高级会员 / 充值
        </Link>
        <Link
          href="/feedback"
          className="rounded-2xl bg-[var(--grouped-background)] px-4 py-4 text-[15px] font-medium text-[var(--label)]"
        >
          意见反馈
        </Link>
        <Link
          href="/announcements"
          className="rounded-2xl bg-[var(--grouped-background)] px-4 py-4 text-[15px] font-medium text-[var(--label)]"
        >
          公告
        </Link>
        <Link
          href="/records"
          className="rounded-2xl bg-[var(--grouped-background)] px-4 py-4 text-[15px] font-medium text-[var(--label)]"
        >
          我的记录
        </Link>
      </section>

      {isAdmin && (
        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[var(--label)]">
            管理后台
          </h2>
          <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
            仅管理员可见。
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
            >
              实名审计
            </Link>
            <Link
              href="/admin/feedback"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black/[0.06] px-4 text-[15px] font-medium text-[var(--label)] dark:bg-white/[0.1]"
            >
              反馈
            </Link>
            <Link
              href="/admin/feedback?kind=plus"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black/[0.06] px-4 text-[15px] font-medium text-[var(--label)] dark:bg-white/[0.1]"
            >
              高级反馈
            </Link>
            <Link
              href="/admin/announcements"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black/[0.06] px-4 text-[15px] font-medium text-[var(--label)] dark:bg-white/[0.1]"
            >
              公告管理
            </Link>
            <Link
              href="/admin/sensitive"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black/[0.06] px-4 text-[15px] font-medium text-[var(--label)] dark:bg-white/[0.1]"
            >
              敏感词
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
