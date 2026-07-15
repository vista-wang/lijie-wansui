import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Rating",
  description:
    "Universal evaluation system — anonymous public ratings with accountable audit trail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
