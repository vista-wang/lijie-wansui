import { SignUp } from "@clerk/nextjs";

/**
 * 理解万岁 · 注册页
 * 使用 Cursor 制作
 */

export default function SignUpPage() {
  return (
    <main className="flex min-h-[70vh] w-full flex-1 items-center justify-center py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}
