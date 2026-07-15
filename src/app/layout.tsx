/**
 * 理解万岁 · 根布局
 * 使用 Cursor 制作
 */

import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
        <AuthProvider>
          <AppHeader />
          <div className="flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
            <AppShell>{children}</AppShell>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
