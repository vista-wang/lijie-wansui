/**
 * 理解万岁 · 微信网站登录 → OIDC 代理（供 Clerk Custom Provider）
 * 使用 Cursor 制作
 *
 * 说明：微信开放平台「网站应用微信登录」(qrconnect) 不是标准 OIDC。
 * 本代理把它包装成 Discovery / authorize / token / userinfo，
 * 以便在 Clerk Dashboard 用 Custom provider 接入。
 *
 * 用户给的 PC OpenSDK 文档是拉起 PC 小程序，不用于登录。
 */

import { SignJWT, jwtVerify } from "jose";

export function getAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return (fromEnv || "http://localhost:3000").replace(/\/$/, "");
}

export function wechatOidcIssuer(): string {
  return `${getAppOrigin()}/api/oauth/wechat`;
}

export function isWechatOidcConfigured(): boolean {
  if (process.env.WECHAT_LOGIN_ENABLED !== "true") return false;
  return Boolean(
    process.env.WECHAT_APP_ID &&
      process.env.WECHAT_APP_SECRET &&
      process.env.WECHAT_OIDC_CLIENT_ID &&
      process.env.WECHAT_OIDC_CLIENT_SECRET,
  );
}

function secretKey(): Uint8Array {
  const raw =
    process.env.WECHAT_OIDC_JWT_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "dev-only-wechat-oidc-secret";
  return new TextEncoder().encode(raw);
}

export type PendingAuth = {
  clerkRedirectUri: string;
  clerkState: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
};

export type AuthCodePayload = {
  typ: "auth_code";
  openid: string;
  unionid?: string;
  accessToken: string;
  nickname?: string;
  headimgurl?: string;
  clerkRedirectUri: string;
  clerkState: string;
};

export async function sealPending(data: PendingAuth): Promise<string> {
  return new SignJWT({ ...data, typ: "pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function openPending(token: string): Promise<PendingAuth> {
  const { payload } = await jwtVerify(token, secretKey());
  if (payload.typ !== "pending") throw new Error("invalid pending");
  return {
    clerkRedirectUri: String(payload.clerkRedirectUri),
    clerkState: String(payload.clerkState),
    codeChallenge:
      typeof payload.codeChallenge === "string"
        ? payload.codeChallenge
        : undefined,
    codeChallengeMethod:
      typeof payload.codeChallengeMethod === "string"
        ? payload.codeChallengeMethod
        : undefined,
  };
}

export async function sealAuthCode(data: AuthCodePayload): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secretKey());
}

export async function openAuthCode(code: string): Promise<AuthCodePayload> {
  const { payload } = await jwtVerify(code, secretKey());
  if (payload.typ !== "auth_code") throw new Error("invalid code");
  return {
    typ: "auth_code",
    openid: String(payload.openid),
    unionid:
      typeof payload.unionid === "string" ? payload.unionid : undefined,
    accessToken: String(payload.accessToken),
    nickname:
      typeof payload.nickname === "string" ? payload.nickname : undefined,
    headimgurl:
      typeof payload.headimgurl === "string" ? payload.headimgurl : undefined,
    clerkRedirectUri: String(payload.clerkRedirectUri),
    clerkState: String(payload.clerkState),
  };
}

export async function mintIdToken(input: {
  sub: string;
  nickname?: string;
  picture?: string;
}): Promise<string> {
  const issuer = wechatOidcIssuer();
  return new SignJWT({
    name: input.nickname || "微信用户",
    preferred_username: input.nickname || input.sub,
    picture: input.picture,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.sub)
    .setIssuer(issuer)
    .setAudience(process.env.WECHAT_OIDC_CLIENT_ID!)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey());
}

export function assertOidcClient(
  clientId: string | null,
  clientSecret: string | null,
): void {
  if (
    clientId !== process.env.WECHAT_OIDC_CLIENT_ID ||
    clientSecret !== process.env.WECHAT_OIDC_CLIENT_SECRET
  ) {
    throw new Error("invalid_client");
  }
}

export type WechatTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  openid?: string;
  scope?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

export type WechatUserInfo = {
  openid?: string;
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

export async function exchangeWechatCode(
  code: string,
): Promise<WechatTokenResponse> {
  const appId = process.env.WECHAT_APP_ID!;
  const secret = process.env.WECHAT_APP_SECRET!;
  const url = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", secret);
  url.searchParams.set("code", code);
  url.searchParams.set("grant_type", "authorization_code");
  const res = await fetch(url.toString(), { cache: "no-store" });
  return (await res.json()) as WechatTokenResponse;
}

export async function fetchWechatUserInfo(
  accessToken: string,
  openid: string,
): Promise<WechatUserInfo> {
  const url = new URL("https://api.weixin.qq.com/sns/userinfo");
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("openid", openid);
  url.searchParams.set("lang", "zh_CN");
  const res = await fetch(url.toString(), { cache: "no-store" });
  return (await res.json()) as WechatUserInfo;
}
