"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { createInstance } from "@/lib/data/repositories";
import type { ScoringMode } from "@/lib/types/domain";

export default function NewInstancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [scoringMode, setScoringMode] = useState<ScoringMode>("scale_10");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("请先登录伪账号");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("请填写标题与描述");
      return;
    }
    const instance = createInstance({
      title,
      description,
      category: category || undefined,
      scoringMode,
      actorId: user.id,
    });
    router.push(`/instances/${instance.id}`);
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        发一条评价对象
      </h1>
      <p className="mt-2 text-[17px] text-[var(--secondary-label)]">
        可以是一家店、一个议题……选好打分方式后就不能改啦。
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field label="标题">
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：街角咖啡"
          />
        </Field>
        <Field label="描述">
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要说明评价对象"
          />
        </Field>
        <Field label="分类（可选）">
          <input
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="场所 / 议题 / 其他"
          />
        </Field>
        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-[var(--secondary-label)]">
            评分模式
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <ModeCard
              selected={scoringMode === "scale_10"}
              title="1–10 分"
              desc="实例得分取所有评分的平均值"
              onSelect={() => setScoringMode("scale_10")}
            />
            <ModeCard
              selected={scoringMode === "binary"}
              title="赞成 / 反对"
              desc="结果取人数更多的一方"
              onSelect={() => setScoringMode("binary")}
            />
          </div>
        </fieldset>

        {error && (
          <p className="text-[15px] text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button type="submit" className="w-full sm:w-auto">
          发布
        </Button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--separator)] bg-[var(--grouped-background)] px-3 py-3 text-[17px] text-[var(--label)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[var(--secondary-label)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function ModeCard({
  selected,
  title,
  desc,
  onSelect,
}: {
  selected: boolean;
  title: string;
  desc: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        selected
          ? "border-[var(--system-blue)] bg-[var(--system-blue)]/8"
          : "border-[var(--separator)] bg-[var(--grouped-background)]"
      }`}
    >
      <p className="text-[17px] font-semibold text-[var(--label)]">{title}</p>
      <p className="mt-1 text-[13px] text-[var(--secondary-label)]">{desc}</p>
    </button>
  );
}
