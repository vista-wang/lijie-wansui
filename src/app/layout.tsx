/**
 * 理解万岁 · 根布局
 * 使用 Cursor 制作
 */

import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { zhCN } from "@clerk/localizations";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DataProvider } from "@/components/data/DataProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "理解万岁",
  description:
    "理解万岁：看看大家怎么说，按你的口味发现内容。使用 Cursor 制作。",
  other: {
    generator: "使用 Cursor 制作",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ClerkProvider localization={zhCN}>
          <AuthProvider>
            <DataProvider>
              <AppHeader
                authSlot={
                  <div className="hidden items-center gap-2 md:flex">
                    <Show when="signed-out">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="rounded-lg px-2.5 py-2 text-[14px] text-[var(--secondary-label)] hover:text-[var(--label)] sm:px-3 sm:text-[15px]"
                        >
                          登录
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal" forceRedirectUrl="/account">
                        <button
                          type="button"
                          className="rounded-lg bg-[var(--system-blue)] px-3 py-2 text-[14px] font-medium text-white sm:text-[15px]"
                        >
                          注册
                        </button>
                      </SignUpButton>
                    </Show>
                  </div>
                }
              />
              <div className="flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
                <AppShell>{children}</AppShell>
                <SiteFooter />
              </div>
            </DataProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
