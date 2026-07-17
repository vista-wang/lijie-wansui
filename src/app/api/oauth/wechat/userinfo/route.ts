/**
 * 理解万岁 · 微信 OIDC userinfo
 * 使用 Cursor 制作
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchWechatUserInfo } from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // access_token 来自微信；openid 需再查一次时用 auth 接口不方便，
  // 这里用 sns/auth 校验后，要求客户端已有 openid 不现实。
  // 改用：token 换 userinfo 时微信需要 openid——我们在 token 响应里
  // 把 access_token 设为「wechat_access|openid」合成串。
  // 兼容：若是纯微信 access_token，则无法拿 userinfo；见 token 路由改进。

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
