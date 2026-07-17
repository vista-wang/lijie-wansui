import { SignIn } from "@clerk/nextjs";

/**
 * 理解万岁 · 登录页
 * 使用 Cursor 制作
 */

export default function SignInPage() {
  return (
    <main className="flex min-h-[70vh] w-full flex-1 items-center justify-center py-10">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  );
}
