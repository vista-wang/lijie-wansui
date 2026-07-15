"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  createComment,
  getInstanceScoreSummary,
  getMyComment,
  getMyRating,
  getPublicInstance,
  listPublicComments,
  updateComment,
  upsertRating,
} from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import {
  formatDateTime,
  formatScoreSummary,
  scoringModeLabel,
} from "@/lib/i18n/labels";

export default function InstanceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  useStoreRevision();

  const instance = getPublicInstance(id);
  const summary = getInstanceScoreSummary(id);
  const comments = listPublicComments(id);
  const myRating = user ? getMyRating(id, user.id) : null;
  const myComment = user ? getMyComment(id, user.id) : null;
  const myScore = myRating?.score ?? null;
  const hasComment = Boolean(myComment);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!instance) {
    return (
      <main className="w-full py-12 text-[17px] text-[var(--secondary-label)]">
        未找到该实例。
        <Link href="/" className="ml-2 text-[var(--system-blue)]">
          返回列表
        </Link>
      </main>
    );
  }

  function submitScore(score: number) {
    setError("");
    setMessage("");
    if (!user) {
      setError("请先登录伪账号再评分");
      return;
    }
    try {
      upsertRating({ instanceId: id, authorId: user.id, score });
      setMessage(myScore == null ? "评分已提交" : "评分已更新");
    } catch (e) {
      setError(e instanceof Error ? e.message : "评分失败");
    }
  }

  function submitComment(body: string) {
    setError("");
    setMessage("");
    if (!user) {
      setError("请先登录伪账号再评论");
      return;
    }
    if (!body.trim()) {
      setError("评论不能为空");
      return;
    }
    try {
      if (hasComment) {
        updateComment({ instanceId: id, authorId: user.id, body });
        setMessage("评论已更新");
      } else {
        createComment({ instanceId: id, authorId: user.id, body });
        setMessage("评论已发布（每账号仅一条）");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "评论失败");
    }
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <Link
        href="/"
        className="text-[15px] text-[var(--system-blue)] hover:underline"
      >
        ← 实例列表
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[34px] font-semibold tracking-tight text-[var(--label)]">
          {instance.title}
        </h1>
        <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] text-[var(--secondary-label)] dark:bg-white/[0.08]">
          {scoringModeLabel(instance.scoringMode)}
        </span>
      </div>
      <p className="mt-3 text-[17px] leading-relaxed text-[var(--secondary-label)]">
        {instance.description}
      </p>
      <p className="mt-4 text-[22px] font-semibold text-[var(--label)]">
        {summary ? formatScoreSummary(summary) : "暂无数据"}
      </p>

      <section className="mt-10 rounded-2xl bg-[var(--grouped-background)] p-5">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">评分</h2>
        <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
          每账号仅一条评分，可随时修改。
        </p>

        {instance.scoringMode === "scale_10" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => submitScore(n)}
                className={`min-h-11 min-w-11 rounded-xl text-[15px] font-medium transition ${
                  myScore === n
                    ? "bg-[var(--system-blue)] text-white"
                    : "bg-black/[0.06] text-[var(--label)] hover:bg-black/[0.1] dark:bg-white/[0.1]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              variant={myScore === 1 ? "primary" : "secondary"}
              onClick={() => submitScore(1)}
            >
              赞成
            </Button>
            <Button
              type="button"
              variant={myScore === 0 ? "primary" : "secondary"}
              onClick={() => submitScore(0)}
            >
              反对
            </Button>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-[var(--grouped-background)] p-5">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">评论</h2>
        <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
          不展示作者身份；敏感词自动打码。每账号仅一条评论
          {hasComment ? "（可修改原文）" : ""}。
        </p>
        <CommentComposer
          key={`${user?.id ?? "guest"}-${myComment?.id ?? "new"}`}
          initialBody={myComment?.body ?? ""}
          hasComment={hasComment}
          onSubmit={submitComment}
        />
      </section>

      {(message || error) && (
        <p
          className={`mt-4 text-[15px] ${
            error
              ? "text-red-600 dark:text-red-400"
              : "text-[var(--system-blue)]"
          }`}
        >
          {error || message}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">
          全部评论
        </h2>
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3"
            >
              <p className="text-[16px] leading-relaxed text-[var(--label)]">
                {c.body}
              </p>
              <p className="mt-2 text-[12px] text-[var(--secondary-label)]">
                {formatDateTime(c.createdAt)}
              </p>
            </li>
          ))}
          {comments.length === 0 && (
            <li className="text-[15px] text-[var(--secondary-label)]">
              还没有评论。
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}

function CommentComposer({
  initialBody,
  hasComment,
  onSubmit,
}: {
  initialBody: string;
  hasComment: boolean;
  onSubmit: (body: string) => void;
}) {
  const [draftComment, setDraftComment] = useState(initialBody);

  return (
    <>
      <textarea
        className="mt-4 w-full min-h-24 resize-y rounded-xl border border-[var(--separator)] bg-[var(--background)] px-3 py-3 text-[17px] text-[var(--label)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)]"
        value={draftComment}
        onChange={(e) => setDraftComment(e.target.value)}
        placeholder={hasComment ? "修改你的评论" : "写下你的看法"}
      />
      <div className="mt-3">
        <Button type="button" onClick={() => onSubmit(draftComment)}>
          {hasComment ? "更新评论" : "发布评论"}
        </Button>
      </div>
    </>
  );
}
