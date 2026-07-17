/**
 * 理解万岁 · 微信 OIDC userinfo
 * 使用 Cursor 制作
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchWechatUserInfo,
  isWechatOidcConfigured,
} from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isWechatOidcConfigured()) {
    return NextResponse.json(
      { error: "wechat_login_disabled" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const [accessToken, openid] = token.includes("|")
    ? (token.split("|") as [string, string])
    : [token, ""];

  if (!openid) {
    return NextResponse.json(
      {
        error: "invalid_token",
        error_description:
          "access_token 需携带 openid（由本代理签发的合成令牌）",
      },
      { status: 401 },
    );
  }

  const profile = await fetchWechatUserInfo(accessToken, openid);
  if (profile.errcode) {
    return NextResponse.json(
      { error: "invalid_token", detail: profile.errmsg },
      { status: 401 },
    );
  }

  const sub = profile.unionid || profile.openid || openid;
  return NextResponse.json({
    sub,
    name: profile.nickname || "微信用户",
    preferred_username: profile.nickname || sub,
    picture: profile.headimgurl,
    openid: profile.openid || openid,
    unionid: profile.unionid,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
