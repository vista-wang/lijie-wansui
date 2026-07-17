/**
 * 理解万岁 · 微信扫码回调 → 回传 Clerk authorization code
 * 使用 Cursor 制作
 */

import { NextRequest, NextResponse } from "next/server";
import {
  exchangeWechatCode,
  fetchWechatUserInfo,
  isWechatOidcConfigured,
  openPending,
  sealAuthCode,
} from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isWechatOidcConfigured()) {
    return NextResponse.json(
      { error: "wechat_login_disabled" },
      { status: 503 },
    );
  }
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json({ error: "missing_code_or_state" }, { status: 400 });
  }

  let pending;
  try {
    pending = await openPending(state);
  } catch {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }

  const token = await exchangeWechatCode(code);
  if (!token.access_token || !token.openid) {
    return NextResponse.json(
      {
        error: "wechat_token_failed",
        detail: token.errmsg || token.errcode,
      },
      { status: 502 },
    );
  }

  const profile = await fetchWechatUserInfo(token.access_token, token.openid);
  const authCode = await sealAuthCode({
    typ: "auth_code",
    openid: token.openid,
    unionid: token.unionid || profile.unionid,
    accessToken: token.access_token,
    nickname: profile.nickname,
    headimgurl: profile.headimgurl,
    clerkRedirectUri: pending.clerkRedirectUri,
    clerkState: pending.clerkState,
  });

  const redirect = new URL(pending.clerkRedirectUri);
  redirect.searchParams.set("code", authCode);
  redirect.searchParams.set("state", pending.clerkState);
  return NextResponse.redirect(redirect.toString());
}
