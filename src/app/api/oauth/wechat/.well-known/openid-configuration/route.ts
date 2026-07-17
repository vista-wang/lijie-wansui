/**
 * 理解万岁 · 微信 OIDC Discovery
 * 使用 Cursor 制作
 */

import { NextResponse } from "next/server";
import { wechatOidcIssuer } from "@/lib/auth/wechat-oidc";

export const runtime = "nodejs";

export async function GET() {
  const issuer = wechatOidcIssuer();
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/userinfo`,
    jwks_uri: `${issuer}/jwks`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["HS256"],
    scopes_supported: ["openid", "profile"],
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],
    claims_supported: [
      "sub",
      "name",
      "preferred_username",
      "picture",
      "openid",
      "unionid",
    ],
  });
}
