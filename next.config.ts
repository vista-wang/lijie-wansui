/**
 * 理解万岁 · Next.js 配置（适配 Vercel）
 * 使用 Cursor 制作
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 默认即可部署 App Router；关闭生产环境浏览器 source map 减小产物
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
