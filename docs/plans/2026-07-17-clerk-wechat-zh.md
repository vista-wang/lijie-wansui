# Clerk Custom Provider：微信网站登录

> 使用 Cursor 制作  
> **当前状态：未启用。** 勿在 Clerk Dashboard 打开微信 Custom provider；代理默认关闭（需 `WECHAT_LOGIN_ENABLED=true`）。

> 注意：[PC OpenSDK](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_PC_APIs/guideline.html) 是拉起 PC 小程序，**不是登录**。  
> 登录请用 [网站应用微信登录](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)（`qrconnect`）。

代码已就绪（OIDC 代理在 `/api/oauth/wechat/*`），启用前请确认环境变量与开放平台配置，再设：

```bash
WECHAT_LOGIN_ENABLED=true
```

并在 Clerk 中配置 Custom provider（见下文）。启用前请勿在 Dashboard 打开该连接。

## Endpoints（启用后）

| Endpoint | URL |
|----------|-----|
| Discovery | `{APP_URL}/api/oauth/wechat/.well-known/openid-configuration` |
| Authorize | `{APP_URL}/api/oauth/wechat/authorize` |
| Token | `{APP_URL}/api/oauth/wechat/token` |
| UserInfo | `{APP_URL}/api/oauth/wechat/userinfo` |

## 环境变量

见 `.env.example`。未设 `WECHAT_LOGIN_ENABLED=true` 时，上述路由一律 `503`。

## Clerk Dashboard（以后启用时）

1. SSO connections → Custom provider  
2. Discovery / Client ID / Secret 按上表与 env  
3. **Enable connection**（仅当你准备上线微信登录时）

## 中文

根布局已用 `zhCN`。启用 Custom provider 后登录组件会出现「微信」按钮。
