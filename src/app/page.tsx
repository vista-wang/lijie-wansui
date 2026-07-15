"use client";

/**
 * 理解万岁 · 主页（推荐混排）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InstanceList } from "@/components/instances/InstanceList";
import { Pagination } from "@/components/ui/Pagination";
import {
  buildMixedFeed,
  paginateBalanced,
  todaySeed,
  toRecommendItems,
} from "@/lib/data/recommend";
import {
  getInstanceScoreSummary,
  listPublicInstances,
} from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";

/** 每页条数；保证常见数据量下出现多页 */
const PAGE_SIZE = 4;

function HomeContent() {
  useStoreRevision();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const catalog = toRecommendItems(
    listPublicInstances().map((instance) => ({
      instance,
      summary: getInstanceScoreSummary(instance.id),
    })),
  );
  const feed = buildMixedFeed(catalog, {
    targetAgreeRatio: 0.5,
    minShare: 0.35,
    maxShare: 0.65,
    seed: todaySeed(),
  });
  // 分页以完整混排列表为准，避免钳制逻辑把总页数算丢
  const totalPages = Math.max(1, Math.ceil(feed.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const { rows } = paginateBalanced(feed, current, {
    pageSize: PAGE_SIZE,
    minShare: 0.35,
    maxShare: 0.65,
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 animate-rise">
          <p className="text-[13px] font-medium text-[var(--secondary-label)]">
            推荐
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
            主页
          </h1>
        </div>
        <Link
          href="/instances/new"
          className="btn-press mt-6 inline-flex min-h-11 shrink-0 items-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
        >
          新建
        </Link>
      </div>
      <p
        className="animate-rise mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--secondary-label)] sm:text-[17px]"
        style={{ animationDelay: "60ms" }}
      >
        按两边声音混排推荐，避免一边刷屏。写操作需登录。
      </p>

      <div className="mt-8 sm:mt-10">
        <InstanceList rows={rows} />
      </div>

      <Pagination
        page={current}
        totalPages={totalPages}
        hrefForPage={(p) => (p <= 1 ? "/" : `/?page=${p}`)}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-5 py-16 text-[var(--secondary-label)]">
          加载中…
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
