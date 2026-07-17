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
  {
    href: "/announcements",
    label: "公告",
    match: (p: string) => p.startsWith("/announcements"),
  },
] as const;

function navClass(active: boolean) {
  return `rounded-lg px-2.5 py-2 text-[14px] transition-colors sm:px-3 sm:text-[15px] ${
    active
      ? "bg-black/[0.06] font-medium text-[var(--label)] dark:bg-white/[0.1]"
      : "text-[var(--secondary-label)] hover:text-[var(--label)]"
  }`;
}

export function AppHeader({ authSlot }: { authSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const membershipActive = pathname.startsWith("/membership");
  const accountActive = pathname.startsWith("/account");

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--separator)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-5">
          <Link
            href="/"
            className="shrink-0 text-[17px] font-semibold tracking-tight text-[var(--label)]"
          >
            理解万岁
          </Link>

          <nav className="hidden flex-1 items-center gap-0.5 md:flex">
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

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/membership"
              className={`hidden md:inline-flex ${navClass(membershipActive)} text-[var(--system-blue)]`}
            >
              高级会员
            </Link>
            <Link
              href="/account"
              className={`hidden md:inline-flex ${navClass(accountActive)}`}
            >
              账号
            </Link>
            {authSlot}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--separator)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="主导航"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-5 px-0.5 pt-1">
          {[
            ...navItems.slice(0, 3),
            {
              href: "/membership",
              label: "会员",
              match: (p: string) => p.startsWith("/membership"),
            },
            {
              href: "/account",
              label: "账号",
              match: (p: string) => p.startsWith("/account"),
            },
          ].map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${
                  active
                    ? "font-semibold text-[var(--system-blue)]"
                    : "text-[var(--secondary-label)]"
                }`}
              >
                <span className="text-[14px] leading-none" aria-hidden>
                  {item.label === "主页"
                    ? "⌂"
                    : item.label === "搜索"
                      ? "⌕"
                      : item.label === "记录"
                        ? "☰"
                        : item.label === "会员"
                          ? "◆"
                          : "◔"}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
