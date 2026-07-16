/**
 * 理解万岁 · 隐私政策页
 * 使用 Cursor 制作
 *
 * 文案请改 src/content/privacy-policy.ts
 */

import {
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_META,
  PRIVACY_POLICY_SECTIONS,
} from "@/content/privacy-policy";

export default function PrivacyPage() {
  return (
    <main className="w-full flex-1 pb-10 pt-1 sm:pt-2">
      <p className="text-[13px] font-medium text-[var(--secondary-label)]">
        法律信息
      </p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[var(--label)] sm:text-[34px]">
        {PRIVACY_POLICY_META.title}
      </h1>
      <p className="mt-2 text-[14px] text-[var(--secondary-label)]">
        {PRIVACY_POLICY_META.siteName} · 更新日期：
        {PRIVACY_POLICY_META.updatedAt}
      </p>

      <div className="mt-8 max-w-3xl space-y-4 text-[15px] leading-relaxed text-[var(--secondary-label)] sm:text-[16px]">
        {PRIVACY_POLICY_INTRO.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <div className="mt-10 max-w-3xl space-y-8">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[18px] font-semibold text-[var(--label)] sm:text-[20px]">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--secondary-label)] sm:text-[16px]">
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 max-w-3xl text-[13px] text-[var(--secondary-label)]">
        文案文件：
        <code className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[12px] dark:bg-white/[0.08]">
          src/content/privacy-policy.ts
        </code>
      </p>
    </main>
  );
}
