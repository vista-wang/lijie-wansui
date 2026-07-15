"use client";

/**
 * 理解万岁 · 主页（用户亲和推荐 + 随机广告穿插）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { AdSlot } from "@/components/ads/AdSlot";
import { useAuth } from "@/components/auth/AuthProvider";
import { InstanceList } from "@/components/instances/InstanceList";
import { Pagination } from "@/components/ui/Pagination";
import { weaveAdsIntoFeed } from "@/lib/data/ads";
import { getHomeRecommendPage } from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { useMembership } from "@/lib/hooks/useMembership";

const PAGE_SIZE = 6;

function HomeContent() {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const { tier, label, showAds } = useMembership();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const result = ready
    ? getHomeRecommendPage({
        userId: user?.id ?? null,
        page,
        pageSize: PAGE_SIZE,
      })
    : null;

  const feed = useMemo(() => {
    if (!result) return [];
    if (!showAds) {
      return result.rows.map((data) => ({
        kind: "content" as const,
        data,
      }));
    }
    return weaveAdsIntoFeed(
      result.rows,
      `home-${page}-${user?.id ?? "guest"}-${new Date().toISOString().slice(0, 10)}`,
    );
  }, [result, showAds, page, user?.id]);

  if (!ready || !result) {
    return (
      <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
          今天看看
        </h1>
        <p className="mt-4 text-[15px] text-[var(--secondary-label)]">
          正在为你准备内容…
        </p>
      </main>
    );
  }

  const { totalPages, page: current } = result;

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 animate-rise">
          <p className="text-[13px] font-medium text-[var(--secondary-label)]">
            为你精选
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
            今天看看
          </h1>
        </div>
        <Link
          href="/instances/new"
          className="btn-press mt-6 inline-flex min-h-11 shrink-0 items-center rounded-xl bg-[var(--system-blue)] px-4 text-[15px] font-medium text-white"
        >
          发一条
        </Link>
      </div>
      <p
        className="animate-rise mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--secondary-label)] sm:text-[17px]"
        style={{ animationDelay: "60ms" }}
      >
        {user
          ? `按你的口味挑了一批${
              tier !== "free" ? `（${label}）` : ""
            }。喜欢就评一下，越用越懂你。`
          : "先随便逛逛。登录后，我们会按你的喜好来推荐。"}
      </p>

      <div className="mt-8 space-y-3 sm:mt-10">
        {feed.map((entry, index) =>
          entry.kind === "ad" ? (
            <AdSlot
              key={`ad-${index}-${entry.ad.id}`}
              creative={entry.ad}
              seed={`home-inline-${index}`}
            />
          ) : (
            <InstanceList
              key={entry.data.instance.id}
              rows={[entry.data]}
              animated={index < 4}
            />
          ),
        )}
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
