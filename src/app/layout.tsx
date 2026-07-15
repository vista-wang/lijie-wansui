/**
 * 理解万岁 · 根布局
 * 使用 Cursor 制作
 */

import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "理解万岁",
  description: "通用评价系统：推荐混排、公开评分与评论，后台实名审计。使用 Cursor 制作。",
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
            {children}
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
