"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { InstanceList } from "@/components/instances/InstanceList";
import {
  getInstanceScoreSummary,
  listPublicInstances,
} from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";

function SearchContent({ initialQuery }: { initialQuery: string }) {
  useStoreRevision();
  const [query, setQuery] = useState(initialQuery);
  const q = query.trim().toLowerCase();

  const rows = useMemo(() => {
    const all = listPublicInstances();
    const filtered = q
      ? all.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            (i.category?.toLowerCase().includes(q) ?? false),
        )
      : all;
    return filtered.map((instance) => ({
      instance,
      summary: getInstanceScoreSummary(instance.id),
    }));
  }, [q]);

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        搜索
      </h1>
      <p className="mt-2 text-[15px] text-[var(--secondary-label)] sm:text-[17px]">
        按标题、描述或分类查找实例。
      </p>

      <label className="mt-6 block">
        <span className="sr-only">关键词</span>
        <input
          type="search"
          enterKeyHint="search"
          className="w-full min-h-12 rounded-2xl border border-[var(--separator)] bg-[var(--grouped-background)] px-4 text-[17px] text-[var(--label)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]"
          placeholder="输入关键词"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </label>

      <div className="mt-8">
        <InstanceList rows={rows} />
      </div>
    </main>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  return <SearchContent key={initialQuery} initialQuery={initialQuery} />;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full py-12 text-[var(--secondary-label)]">
          加载中…
        </main>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
