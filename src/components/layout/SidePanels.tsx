"use client";

/**
 * 理解万岁 · 桌面侧栏
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { AiwAdSlot } from "@/components/ads/AdSlot";
import { getSidebarPanels } from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { formatDateTime } from "@/lib/i18n/labels";
import { useData } from "@/components/data/DataProvider";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[var(--grouped-background)] p-4 shadow-[0_1px_0_var(--separator)]">
      <h2 className="text-[13px] font-semibold tracking-wide text-[var(--secondary-label)]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SideSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--grouped-background)]" />
      <div className="h-32 animate-pulse rounded-2xl bg-[var(--grouped-background)]" />
    </div>
  );
}

export function LeftSidePanel() {
  const ready = useClientReady();
  const { ready: dataReady } = useData();
  useStoreRevision();

  if (!ready || !dataReady) return <SideSkeleton />;

  const { hot, categories } = getSidebarPanels();

  return (
    <div className="space-y-4 animate-rise">
      <AiwAdSlot />

      <Panel title="大家都在看">
        <ol className="space-y-2.5">
          {hot.map((item, index) => (
            <li key={item.id}>
              <Link
                href={`/instances/${item.id}`}
                className="group flex items-start gap-2.5 rounded-xl px-1 py-1 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <span
                  className={`mt-0.5 w-5 shrink-0 text-center text-[13px] font-semibold tabular-nums ${
                    index < 3
                      ? "text-[var(--system-blue)]"
                      : "text-[var(--secondary-label)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[14px] font-medium text-[var(--label)] group-hover:text-[var(--system-blue)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[var(--secondary-label)]">
                    {item.scoreLabel} · {item.count} 人
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {hot.length === 0 && (
            <p className="text-[13px] text-[var(--secondary-label)]">暂无数据</p>
          )}
        </ol>
      </Panel>

      <Panel title="按类型逛">
        <ul className="space-y-2">
          {categories.map((item) => (
            <li key={item.category}>
              <Link
                href={`/search?q=${encodeURIComponent(item.category)}`}
                className="flex items-center justify-between rounded-xl px-1 py-1.5 text-[14px] transition hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <span className="text-[var(--label)]">{item.category}</span>
                <span className="tabular-nums text-[12px] text-[var(--secondary-label)]">
                  {item.count}
                </span>
              </Link>
            </li>
          ))}
          {categories.length === 0 && (
            <p className="text-[13px] text-[var(--secondary-label)]">暂无分类</p>
          )}
        </ul>
      </Panel>
    </div>
  );
}

export function RightSidePanel() {
  const ready = useClientReady();
  const { ready: dataReady } = useData();
  useStoreRevision();

  if (!ready || !dataReady) return <SideSkeleton />;

  const { recent, hot } = getSidebarPanels();
  const rising = hot.slice().sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-4 animate-rise" style={{ animationDelay: "80ms" }}>
      <Panel title="新鲜出炉">
        <ul className="space-y-2.5">
          {recent.map((item) => (
            <li key={item.id}>
              <Link
                href={`/instances/${item.id}`}
                className="block rounded-xl px-1 py-1 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <span className="line-clamp-2 text-[14px] font-medium text-[var(--label)]">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[12px] text-[var(--secondary-label)]">
                  {formatDateTime(item.createdAt)}
                </span>
              </Link>
            </li>
          ))}
          {recent.length === 0 && (
            <p className="text-[13px] text-[var(--secondary-label)]">还没有内容</p>
          )}
        </ul>
      </Panel>

      <Panel title="聊得火热">
        <ul className="space-y-2">
          {rising.map((item) => (
            <li key={item.id}>
              <Link
                href={`/instances/${item.id}`}
                className="flex items-center justify-between gap-2 rounded-xl px-1 py-1.5 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <span className="line-clamp-1 text-[14px] text-[var(--label)]">
                  {item.title}
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-[var(--system-blue)]">
                  {item.count}
                </span>
              </Link>
            </li>
          ))}
          {rising.length === 0 && (
            <p className="text-[13px] text-[var(--secondary-label)]">暂无数据</p>
          )}
        </ul>
      </Panel>

      <Panel title="小贴士">
        <p className="text-[13px] leading-relaxed text-[var(--secondary-label)]">
          多评几条，首页会更懂你。评分和评论都能自己选要不要匿名。
        </p>
        <Link
          href="/feedback"
          className="mt-3 inline-block text-[13px] font-medium text-[var(--system-blue)]"
        >
          有想法？去反馈
        </Link>
      </Panel>
    </div>
  );
}
