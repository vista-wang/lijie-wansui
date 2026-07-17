/**
 * 理解万岁 · 微信 OIDC authorize → 跳转 qrconnect
 * 使用 Cursor 制作
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAppOrigin,
  isWechatOidcConfigured,
  sealPending,
} from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isWechatOidcConfigured()) {
    return NextResponse.json(
      { error: "wechat_oidc_not_configured" },
      { status: 503 },
    );
  }

  const url = req.nextUrl;
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state") || "";
  const scope = url.searchParams.get("scope") || "openid profile";
  const codeChallenge = url.searchParams.get("code_challenge") || undefined;
  const codeChallengeMethod =
    url.searchParams.get("code_challenge_method") || undefined;

  if (clientId !== process.env.WECHAT_OIDC_CLIENT_ID || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const pending = await sealPending({
    clerkRedirectUri: redirectUri,
    clerkState: state,
    codeChallenge,
    codeChallengeMethod,
  });

  const callback = `${getAppOrigin()}/api/oauth/wechat/callback`;
  const wechat = new URL("https://open.weixin.qq.com/connect/qrconnect");
  wechat.searchParams.set("appid", process.env.WECHAT_APP_ID!);
  wechat.searchParams.set("redirect_uri", callback);
  wechat.searchParams.set("response_type", "code");
  wechat.searchParams.set("scope", "snsapi_login");
  wechat.searchParams.set("state", pending);
  // scope 参数保留给日志；微信侧固定 snsapi_login
  void scope;

  return NextResponse.redirect(`${wechat.toString()}#wechat_redirect`);
}
