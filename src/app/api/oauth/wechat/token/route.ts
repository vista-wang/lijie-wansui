/**
 * 理解万岁 · 微信 OIDC token
 * 使用 Cursor 制作
 */

import { NextRequest, NextResponse } from "next/server";
import {
  assertOidcClient,
  mintIdToken,
  openAuthCode,
} from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

function parseBasicAuth(header: string | null): {
  clientId: string | null;
  clientSecret: string | null;
} {
  if (!header?.startsWith("Basic ")) return { clientId: null, clientSecret: null };
  try {
    const decoded = atob(header.slice(6));
    const idx = decoded.indexOf(":");
    if (idx < 0) return { clientId: null, clientSecret: null };
    return {
      clientId: decoded.slice(0, idx),
      clientSecret: decoded.slice(idx + 1),
    };
  } catch {
    return { clientId: null, clientSecret: null };
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let body: URLSearchParams;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    body = new URLSearchParams(await req.text());
  } else if (contentType.includes("application/json")) {
    const json = (await req.json()) as Record<string, string>;
    body = new URLSearchParams(json);
  } else {
    body = new URLSearchParams(await req.text());
  }

  const basic = parseBasicAuth(req.headers.get("authorization"));
  const clientId = body.get("client_id") || basic.clientId;
  const clientSecret = body.get("client_secret") || basic.clientSecret;

  try {
    assertOidcClient(clientId, clientSecret);
  } catch {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const grantType = body.get("grant_type");
  if (grantType !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const code = body.get("code");
  if (!code) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  let payload;
  try {
    payload = await openAuthCode(code);
  } catch {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  const sub = payload.unionid || payload.openid;
  const idToken = await mintIdToken({
    sub,
    nickname: payload.nickname,
    picture: payload.headimgurl,
  });

  // 合成 access_token，供 userinfo 解析 openid
  const accessToken = `${payload.accessToken}|${payload.openid}`;

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 7200,
    id_token: idToken,
    scope: "openid profile",
  });
}
