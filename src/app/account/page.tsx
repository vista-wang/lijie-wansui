"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { useMembership } from "@/lib/hooks/useMembership";

export default function AccountPage() {
  const { user, users, signIn, signOut, ready } = useAuth();
  const { tier, label } = useMembership();
  const isAdmin = user?.role === "admin";

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        我的账号
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        管理登录与会员权益。现在用的是演示账号，正式版会换成手机号等方式登录。
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

      <section className="mt-8">
        <h2 className="text-[17px] font-semibold text-[var(--label)]">
          切换演示账号
        </h2>
        <ul className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {users.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => signIn(u.id)}
                className={`flex w-full min-h-12 items-center justify-between rounded-2xl px-4 text-left text-[16px] transition ${
                  user?.id === u.id
                    ? "bg-[var(--system-blue)] text-white"
                    : "bg-[var(--grouped-background)] text-[var(--label)] hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                }`}
              >
                <span>{u.displayName}</span>
                {user?.id === u.id && (
                  <span className="text-[13px] opacity-90">当前</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {user && (
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={signOut}
          >
            退出登录
          </Button>
        )}
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
