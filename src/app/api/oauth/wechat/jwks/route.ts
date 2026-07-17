/**
 * 理解万岁 · JWKS 占位（id_token 使用 HS256，对称密钥不在 JWKS 暴露）
 * 使用 Cursor 制作
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ keys: [] });
}
