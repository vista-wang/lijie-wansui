/**
 * 理解万岁 · 页脚
 * 使用 Cursor 制作
 */

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--separator)] px-4 py-6 sm:px-5">
      <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-[13px] text-[var(--secondary-label)]">理解万岁</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[12px]">
          <Link href="/announcements" className="text-[var(--secondary-label)]">
            公告
          </Link>
          <Link href="/feedback" className="text-[var(--secondary-label)]">
            反馈
          </Link>
          <Link href="/membership" className="text-[var(--secondary-label)]">
            会员
          </Link>
          <Link href="/privacy" className="text-[var(--secondary-label)]">
            隐私政策
          </Link>
          <span className="animate-fade-pulse font-medium tracking-wide text-[var(--system-blue)]">
            使用 Cursor 制作
          </span>
        </div>
      </div>
    </footer>
  );
}
