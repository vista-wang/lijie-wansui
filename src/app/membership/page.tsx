"use client";

/**
 * 理解万岁 · 会员状态说明（订阅入口已关闭）
 * 使用 Cursor 制作
 */

import Link from "next/link";
import { MembershipBadge } from "@/components/membership/MembershipBadge";
import { useMembership } from "@/lib/hooks/useMembership";

export default function MembershipPage() {
  const { tier, label, ready } = useMembership();

  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <p className="text-[13px] font-medium text-[var(--secondary-label)]">
        会员
      </p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        会员状态
      </h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--secondary-label)] sm:text-[17px]">
        当前身份：
        <span className="font-medium text-[var(--label)]">
          {ready ? label : "…"}
        </span>
        。在线订阅暂未开放，权益由管理员配置。
      </p>

      <div className="mt-6">
        <MembershipBadge tier={tier} />
      </div>

      <ul className="mt-8 space-y-2 text-[15px] text-[var(--secondary-label)]">
        <li>· 高级 / 超级会员可免广告、反馈优先，并享有推荐加权与专属徽章</li>
        <li>· 超级会员可查看「与开发者交流」类公告</li>
        <li>· 管理员账号自动享有超级会员权益</li>
      </ul>

      <p className="mt-8 text-[15px]">
        <Link href="/account" className="text-[var(--system-blue)]">
          返回账号
        </Link>
      </p>
    </main>
  );
}
