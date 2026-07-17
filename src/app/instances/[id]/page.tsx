"use client";

/**
 * 理解万岁 · 详情（可选匿名）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useData } from "@/components/data/DataProvider";
import { Button } from "@/components/ui/Button";
import {
  createCommentAction,
  updateCommentAction,
  upsertRatingAction,
} from "@/lib/data/actions";
import {
  getInstanceScoreSummary,
  getMyComment,
  getMyRating,
  getPublicInstance,
  listPublicComments,
} from "@/lib/data/repositories";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import {
  formatDateTime,
  formatScoreSummary,
  scoringModeLabel,
} from "@/lib/i18n/labels";
import { REAL_NAME_REQUIRED } from "@/lib/auth/messages";

export default function InstanceDetailPage() {
  const ready = useClientReady();
  const { ready: dataReady, refresh } = useData();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, canAct } = useAuth();
  useStoreRevision();

  const loaded = ready && dataReady;
  const instance = loaded ? getPublicInstance(id) : null;
  const summary = loaded ? getInstanceScoreSummary(id) : null;
  const comments = loaded ? listPublicComments(id) : [];
  const myRating = loaded && canAct && user ? getMyRating(id, user.id) : null;
  const myComment = loaded && canAct && user ? getMyComment(id, user.id) : null;
  const myScore = myRating?.score ?? null;
  const hasComment = Boolean(myComment);

  const rateAnonymousRef = useRef(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!loaded) {
    return (
      <main className="w-full py-12 text-[var(--secondary-label)]">加载中…</main>
    );
  }

  if (!instance) {
    return (
      <main className="w-full py-12 text-[17px] text-[var(--secondary-label)]">
        没找到这条内容。
        <Link href="/" className="ml-2 text-[var(--system-blue)]">
          回首页
        </Link>
      </main>
    );
  }

  async function submitScore(score: number) {
    setError("");
    setMessage("");
    if (!canAct) {
      setError(REAL_NAME_REQUIRED);
      return;
    }
    try {
      await upsertRatingAction({
        instanceId: id,
        score,
        anonymous: rateAnonymousRef.current,
      });
      await refresh();
      setMessage(myScore == null ? "评分已提交" : "评分已更新");
    } catch (e) {
      setError(e instanceof Error ? e.message : "评分失败");
    }
  }

  async function submitComment(body: string, anonymous: boolean) {
    setError("");
    setMessage("");
    if (!canAct) {
      setError(REAL_NAME_REQUIRED);
      return;
    }
    if (!body.trim()) {
      setError("评论不能为空");
      return;
    }
    try {
      if (hasComment) {
        await updateCommentAction({
          instanceId: id,
          body,
          anonymous,
        });
        setMessage("评论已更新");
      } else {
        await createCommentAction({
          instanceId: id,
          body,
          anonymous,
        });
        setMessage("评论已发布（每人只能留一条）");
      }
      await refresh();
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
        ← 回首页
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
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
        {summary ? formatScoreSummary(summary) : "还没人评"}
      </p>

      <section className="mt-8 rounded-2xl bg-[var(--grouped-background)] p-5">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">评分</h2>
        <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
          每人一条，可改。是否公开姓名由你决定。
        </p>
        {!canAct && (
          <p className="mt-3 text-[14px] text-[var(--system-blue)]">
            {REAL_NAME_REQUIRED}（
            <Link href="/account" className="underline-offset-2 hover:underline">
              去账号页
            </Link>
            ）
          </p>
        )}
        <RateAnonToggle
          key={`rate-anon-${myRating?.updatedAt ?? "new"}`}
          initialAnonymous={myRating?.anonymous !== false}
          onChange={(value) => {
            rateAnonymousRef.current = value;
          }}
        />

        {instance.scoringMode === "scale_10" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                disabled={!canAct}
                onClick={() => submitScore(n)}
                className={`min-h-11 min-w-11 rounded-xl text-[15px] font-medium transition disabled:opacity-40 ${
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
              disabled={!canAct}
              onClick={() => submitScore(1)}
            >
              赞成
            </Button>
            <Button
              type="button"
              variant={myScore === 0 ? "primary" : "secondary"}
              disabled={!canAct}
              onClick={() => submitScore(0)}
            >
              反对
            </Button>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-[var(--grouped-background)] p-5">
        <h2 className="text-[20px] font-semibold text-[var(--label)]">评论</h2>
        <p className="mt-1 text-[14px] text-[var(--secondary-label)]">
          敏感词会打码。每人一条
          {hasComment ? "，可改原文与匿名设置" : ""}。
        </p>
        <CommentComposer
          key={`${user?.id ?? "guest"}-${myComment?.id ?? "new"}-${myComment?.updatedAt ?? ""}`}
          initialBody={myComment?.body ?? ""}
          initialAnonymous={myComment?.anonymous !== false}
          hasComment={hasComment}
          disabled={!canAct}
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
            <li key={c.id}>
              <div className="rounded-2xl bg-[var(--grouped-background)] px-4 py-3">
                <p className="text-[16px] leading-relaxed text-[var(--label)]">
                  {c.body}
                </p>
                <p className="mt-2 text-[12px] text-[var(--secondary-label)]">
                  {c.anonymous || !c.displayName ? "匿名" : c.displayName}
                  {" · "}
                  {formatDateTime(c.createdAt)}
                </p>
              </div>
            </li>
          ))}
          {comments.length === 0 && (
            <li className="text-[15px] text-[var(--secondary-label)]">
              还没有评论，来抢沙发吧。
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}

function RateAnonToggle({
  initialAnonymous,
  onChange,
}: {
  initialAnonymous: boolean;
  onChange: (value: boolean) => void;
}) {
  const [anonymous, setAnonymous] = useState(initialAnonymous);

  useEffect(() => {
    onChange(initialAnonymous);
  }, [initialAnonymous, onChange]);

  return (
    <label className="mt-3 flex items-center gap-2 text-[14px] text-[var(--label)]">
      <input
        type="checkbox"
        checked={anonymous}
        onChange={(e) => {
          const next = e.target.checked;
          setAnonymous(next);
          onChange(next);
        }}
      />
      匿名评分（不显示我的名字）
    </label>
  );
}

function CommentComposer({
  initialBody,
  initialAnonymous,
  hasComment,
  disabled = false,
  onSubmit,
}: {
  initialBody: string;
  initialAnonymous: boolean;
  hasComment: boolean;
  disabled?: boolean;
  onSubmit: (body: string, anonymous: boolean) => void;
}) {
  const [draftComment, setDraftComment] = useState(initialBody);
  const [anonymous, setAnonymous] = useState(initialAnonymous);

  return (
    <>
      <textarea
        disabled={disabled}
        className="mt-4 w-full min-h-24 resize-y rounded-xl border border-[var(--separator)] bg-[var(--background)] px-3 py-3 text-[17px] text-[var(--label)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--system-blue)] disabled:opacity-40"
        value={draftComment}
        onChange={(e) => setDraftComment(e.target.value)}
        placeholder={hasComment ? "改改你的评论" : "说说你的看法"}
      />
      <label className="mt-3 flex items-center gap-2 text-[14px] text-[var(--label)]">
        <input
          type="checkbox"
          disabled={disabled}
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        匿名发布（不显示我的名字）
      </label>
      <div className="mt-3">
        <Button
          type="button"
          disabled={disabled}
          onClick={() => onSubmit(draftComment, anonymous)}
        >
          {hasComment ? "更新评论" : "发布评论"}
        </Button>
      </div>
    </>
  );
}
