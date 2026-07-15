"use client";

/**
 * 理解万岁 · 会员充值
 * 使用 Cursor 制作
 */

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  getMembershipTier,
  membershipLabel,
  purchaseMembership,
} from "@/lib/data/membership";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import { MEMBERSHIP_PLANS } from "@/lib/types/membership";

export default function MembershipPage() {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const tier = ready && user ? getMembershipTier(user.id) : "free";

  function buy(plan: "plus" | "super") {
    setMessage("");
    setError("");
    if (!user) {
      setError("请先登录账号，再到这里开通。");
      return;
    }
    try {
      const next = purchaseMembership(user.id, plan);
      setMessage(
        `已开通${membershipLabel(next)}（演示充值，有效期续 30 天）。`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "开通失败");
    }
  }

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <p className="text-[13px] font-medium text-[var(--secondary-label)]">
        会员
      </p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        高级会员
      </h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--secondary-label)] sm:text-[17px]">
        想更清爽、反馈更快被看见？选适合你的方案。当前：
        <span className="font-medium text-[var(--label)]">
          {ready ? membershipLabel(tier) : "…"}
        </span>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {MEMBERSHIP_PLANS.map((plan) => (
          <section
            key={plan.tier}
            className={`rounded-2xl p-5 shadow-[0_1px_0_var(--separator)] ${
              plan.tier === "super"
                ? "bg-[color-mix(in_srgb,var(--grouped-background)_85%,#f5a623)]"
                : "bg-[var(--grouped-background)]"
            }`}
          >
            <h2 className="text-[22px] font-semibold text-[var(--label)]">
              {plan.name}
            </h2>
            <p className="mt-2 text-[28px] font-semibold tabular-nums text-[var(--label)]">
              ¥{plan.priceYuan}
              <span className="text-[15px] font-normal text-[var(--secondary-label)]">
                /{plan.period}
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-[15px] text-[var(--label)]">
              {plan.highlights.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-[var(--system-blue)]">✓</span>
                  {line}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              className="mt-6 w-full"
              variant={plan.tier === "super" ? "primary" : "secondary"}
              onClick={() => buy(plan.tier)}
            >
              {tier === plan.tier ? "续费一个月" : "立即开通"}
            </Button>
          </section>
        ))}
      </div>

      {(message || error) && (
        <p
          className={`mt-5 text-[15px] ${
            error
              ? "text-red-600 dark:text-red-400"
              : "text-[var(--system-blue)]"
          }`}
        >
          {error || message}
        </p>
      )}

      <p className="mt-8 text-[13px] text-[var(--secondary-label)]">
        说明：当前为本地演示充值，不会产生真实扣款。正式上线后将接入支付。
      </p>
    </main>
  );
}
