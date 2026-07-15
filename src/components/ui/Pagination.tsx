import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="分页"
    >
      <PageLink
        href={hrefForPage(page - 1)}
        disabled={page <= 1}
        label="上一页"
      />
      <span className="px-2 text-[14px] text-[var(--secondary-label)]">
        {page} / {totalPages}
      </span>
      <PageLink
        href={hrefForPage(page + 1)}
        disabled={page >= totalPages}
        label="下一页"
      />
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-xl bg-black/[0.04] px-3 text-[14px] text-[var(--secondary-label)] opacity-50">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-xl bg-black/[0.06] px-3 text-[14px] font-medium text-[var(--label)] transition hover:bg-black/[0.1] dark:bg-white/[0.1]"
    >
      {label}
    </Link>
  );
}
