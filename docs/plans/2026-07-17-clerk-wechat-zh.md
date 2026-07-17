# Clerk Custom Provider：微信网站登录

> 使用 Cursor 制作  
> 注意：你提供的 [PC OpenSDK 文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_PC_APIs/guideline.html) 是「网站应用调用 PC 微信能力」（拉起小程序等），**不是登录**。  
> 登录请用 [网站应用微信登录](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)（`qrconnect` + `snsapi_login`）。

微信原生 OAuth **不是** OIDC，Clerk Custom Provider 需要 OIDC。本仓库提供 OIDC 代理：

| Endpoint | URL |
|----------|-----|
| Issuer / Discovery | `{APP_URL}/api/oauth/wechat/.well-known/openid-configuration` |
| Authorize | `{APP_URL}/api/oauth/wechat/authorize` |
| Token | `{APP_URL}/api/oauth/wechat/token` |
| UserInfo | `{APP_URL}/api/oauth/wechat/userinfo` |

## 1. 环境变量

见 `.env.example`：`WECHAT_APP_ID`、`WECHAT_APP_SECRET`、`WECHAT_OIDC_CLIENT_ID`、`WECHAT_OIDC_CLIENT_SECRET`、`NEXT_PUBLIC_APP_URL`。

微信开放平台 → 网站应用 → 授权回调域需包含你的站点域名；  
回调路径固定为：`{APP_URL}/api/oauth/wechat/callback`。

## 2. Clerk Dashboard（Custom provider）

1. [SSO connections](https://dashboard.clerk.com/~/user-authentication/sso-connections) → **Add connection** → **For all users** → **Custom provider**
2. 填写：
   - **Name**：微信
   - **Key**：`wechat`（自定，勿改后乱改）
   - **Discovery Endpoint**：`https://你的域名/api/oauth/wechat/.well-known/openid-configuration`  
     （或 Manual：Authorization / Token / UserInfo 填上表）
   - **Client ID** = `WECHAT_OIDC_CLIENT_ID`
   - **Client Secret** = `WECHAT_OIDC_CLIENT_SECRET`
3. 复制 Clerk 给出的 **Authorized redirect URL**，无需配到微信（微信只回调本代理）
4. **Enable connection**
5. 可选：打开 PKCE（代理已透传 `code_challenge`）

本地开发可用 ngrok / Cloudflare Tunnel 提供 HTTPS 域名，再填入 `NEXT_PUBLIC_APP_URL`。

## 3. 中文

根布局已使用：

```tsx
import { zhCN } from "@clerk/localizations";
<ClerkProvider localization={zhCN}>…
```

启用 Custom provider 后，`<SignIn />` / 弹窗会自动出现「微信」按钮。

## 4. 真名

微信昵称不作实名。首次登录后引导 `/account` 填写真实姓名（现有 `setRealNameAction`）。

## 5. 验收

- [ ] Discovery 可打开且 issuer 正确  
- [ ] Clerk Debug 能走完 authorize → token → userinfo  
- [ ] 扫码登录进入站点  
- [ ] 同一 openid/unionid 再次登录为同一用户  
