/**
 * 理解万岁 · JWKS 占位（id_token 使用 HS256，对称密钥不在 JWKS 暴露）
 * 使用 Cursor 制作
 */

import { NextResponse } from "next/server";
import { isWechatOidcConfigured } from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

export async function GET() {
  if (!isWechatOidcConfigured()) {
    return NextResponse.json(
      { error: "wechat_login_disabled" },
      { status: 503 },
    );
  }
  return NextResponse.json({ keys: [] });
}
