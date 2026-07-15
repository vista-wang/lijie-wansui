"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const { user, users, signIn, signOut, ready } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        账号
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        当前使用本地伪账号。后续将接入正式登录。
      </p>

      <section className="mt-8 rounded-2xl bg-[var(--grouped-background)] p-5">
        <p className="text-[13px] font-medium text-[var(--secondary-label)]">
          当前身份
        </p>
        <p className="mt-2 text-[20px] font-semibold text-[var(--label)]">
          {ready ? (user ? user.displayName : "未登录") : "加载中…"}
        </p>
        {user && (
          <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
            {user.email}
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-[17px] font-semibold text-[var(--label)]">
          切换伪账号
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
            管理功能
          </h2>
          <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
            仅当前管理员可见。
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
            >
              实名审计
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
