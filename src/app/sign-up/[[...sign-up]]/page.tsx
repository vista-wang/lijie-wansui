import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { PRIVACY_AGREE_HINT } from "@/lib/auth/messages";

/**
 * 理解万岁 · 注册页
 * 使用 Cursor 制作
 */

export default function SignUpPage() {
  return (
    <main className="flex min-h-[70vh] w-full flex-1 flex-col items-center justify-center gap-4 py-10">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/account"
        fallbackRedirectUrl="/account"
      />
      <p className="max-w-sm px-4 text-center text-[13px] leading-relaxed text-[var(--secondary-label)]">
        {PRIVACY_AGREE_HINT}（
        <Link href="/privacy" className="text-[var(--system-blue)]">
          查看全文
        </Link>
        ）。注册后须立即填写真实姓名，否则无法发布、评分或评论。
      </p>
    </main>
  );
}
