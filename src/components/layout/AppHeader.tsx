"use client";

/**
 * 理解万岁 · 顶栏 / 底栏导航
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "主页", match: (p: string) => p === "/" },
  {
    href: "/search",
    label: "搜索",
    match: (p: string) => p.startsWith("/search"),
  },
  {
    href: "/records",
    label: "记录",
    match: (p: string) => p.startsWith("/records"),
  },
] as const;

function navClass(active: boolean) {
  return `rounded-lg px-3 py-2 text-[15px] transition-colors ${
    active
      ? "bg-black/[0.06] font-medium text-[var(--label)] dark:bg-white/[0.1]"
      : "text-[var(--secondary-label)] hover:text-[var(--label)]"
  }`;
}

export function AppHeader() {
  const pathname = usePathname();
  const accountActive = pathname.startsWith("/account");

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--separator)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 py-3 sm:gap-4 sm:px-5">
          <Link
            href="/"
            className="shrink-0 text-[17px] font-semibold tracking-tight text-[var(--label)]"
          >
            理解万岁
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navClass(item.match(pathname))}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden md:block">
            <Link href="/account" className={navClass(accountActive)}>
              账号
            </Link>
          </div>

          {/* 窄屏顶栏只保留品牌，导航见底部 */}
          <div className="ml-auto md:hidden" aria-hidden />
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--separator)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="主导航"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4 px-1 pt-1">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active
                    ? "font-semibold text-[var(--system-blue)]"
                    : "text-[var(--secondary-label)]"
                }`}
              >
                <span className="text-[15px] leading-none" aria-hidden>
                  {item.label === "主页" ? "⌂" : item.label === "搜索" ? "⌕" : "☰"}
                </span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/account"
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] ${
              accountActive
                ? "font-semibold text-[var(--system-blue)]"
                : "text-[var(--secondary-label)]"
            }`}
          >
            <span className="text-[15px] leading-none" aria-hidden>
              ◔
            </span>
            账号
          </Link>
        </div>
      </nav>
    </>
  );
}
