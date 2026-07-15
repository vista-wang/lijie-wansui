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
        <p className="animate-fade-pulse text-[13px] font-medium tracking-wide text-[var(--system-blue)]">
          使用 Cursor 制作
        </p>
        <Link
          href="https://cursor.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-[var(--secondary-label)] underline-offset-2 hover:underline"
        >
          cursor.com
        </Link>
      </div>
    </footer>
  );
}
