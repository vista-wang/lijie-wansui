"use client";

/**
 * 理解万岁 · 主页（用户亲和推荐）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { InstanceList } from "@/components/instances/InstanceList";
import { Pagination } from "@/components/ui/Pagination";
import { getHomeRecommendPage } from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";

const PAGE_SIZE = 6;

function HomeContent() {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  if (!ready) {
    return (
      <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
          主页
        </h1>
        <p className="mt-4 text-[15px] text-[var(--secondary-label)]">加载推荐…</p>
      </main>
    );
  }

  const { rows, totalPages, page: current } = getHomeRecommendPage({
    userId: user?.id ?? null,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
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
        {user
          ? "根据你的评分偏好，匹配气味相投的人与内容，并两边混排。"
          : "登录后将按你的偏好个性化推荐；当前为访客混排。"}
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
        <main className="w-full py-12 text-[var(--secondary-label)]">
          加载中…
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
