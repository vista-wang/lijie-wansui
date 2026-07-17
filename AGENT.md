# AGENT.md — 理解万岁

> 使用 Cursor 制作

## Product Goal

Build **理解万岁**, a web-based universal evaluation system: users can discover or create **instances** (subjects of evaluation), then leave **anonymous** public scores and reviews. Every write action is still attributed with the operator’s **real identity** in the backend audit trail.

## Current Phase

- [x] Repo + Next.js environment  
- [x] AGENT.md / CLAUDE.md  
- [x] Initial plan  
- [x] Domain model  
- [x] Core UI（浏览 / 详情 / 创建 / 评分 / 评论）— 全中文  
- [x] Admin / audit + 敏感词打码  
- [x] 推荐（用户亲和协同过滤）+ 会员加权（高级 1.35 / 超级 1.85）  
- [x] 会员 / 广告 / 反馈 / 公告 / 隐私政策 `/privacy`  
- [x] Clerk Auth + 会员元数据 + 真名占用提示 + **zhCN 本地化**  
- [x] **内容仓储切到 Supabase**（无假数据；假种子已删）  
- [x] 左上角仅 AIW（会员免广告时隐藏）；LS / 微信登录代码保留但未启用  
- [ ] 日后启用 Lemon Squeezy 广告 / 微信登录（见文档）  
- [ ] 生产环境补齐 `SUPABASE_SERVICE_ROLE_KEY`（收紧 RLS）

## Repo & continuity

| Item | Value |
|------|--------|
| GitHub | https://github.com/vista-wang/lijie-wansui |
| Branch | `main` |
| npm name | `lijie-wansui` |
| App root | repository root |
| Dev | `npm run dev` → http://localhost:3000 |
| Contact | `support@ethan128.top` |
| AIWriter | **仅**左上角；会员免广告时隐藏 |
| Lemon Squeezy | 代码保留（`lemon-ads` / `/api/ads`），**暂未上线** |
| Clerk 微信 | OIDC 代理已写好，**默认关闭**（`WECHAT_LOGIN_ENABLED`） |

**会话锚点（2026-07-17）：** 认证 Clerk；内容 Supabase（profiles id = Clerk user id text）；本地 mock/种子已移除。

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router + React 19 + TypeScript |
| Styling | Tailwind CSS v4; Apple-HIG-inspired tokens |
| Auth | Clerk（`@clerk/nextjs` + `zhCN`；`src/proxy.ts`） |
| Data | Supabase（浏览器读快照 + server actions 写） |
| Data (schema) | `supabase/migrations/` |
| Deploy | Vercel；repo `vista-wang/lijie-wansui` |

## Locked product rules (2026-07-15+)

1. **Scoring modes** — creator picks **one** mode per instance:
   - `scale_10`: score 1–10; instance score = **mean**  
   - `binary`: 赞成(1) / 反对(0); result = **majority**（平局 `tie`）

2. **Recommendation** — 物以类聚、人以群分（相似用户偏好）：
   - Mix agree / oppose leaning ~50%（夹紧 35–65%）  
   - 会员加权：高级 `1.35`，超级 `1.85`  
   - Cold start：全局均衡混排  

3. **One rating / one comment** per real account per instance（评分可改；评论不可第二条，可编辑）。

4. **Optional anonymity** — 用户自选是否公开展示昵称；审计始终保留 `authorId`。

5. **Membership**  
   - 高级：¥10/月 — 去广告、反馈优先、专属徽章、推荐加权  
   - 超级：¥20/月 — 含高级全部 + 更强加权 +「与开发者交流」  
   - 档位写入 Clerk `publicMetadata`

6. **Ads** — **仅**左上角展示 AIW；会员免广告时隐藏。Lemon Squeezy 代码保留未接 UI。其它页面不放广告。

7. **Audit** — 写操作实名记入后台。

## Domain Sketch

- **Instance** — subject + `scoringMode` (`scale_10` | `binary`).  
- **Rating** — one row per `(authorId, instanceId)`; updatable score.  
- **Comment** — one row per `(authorId, instanceId)`; public may omit name.  
- **User / Profile** — Clerk id ↔ `profiles.id`（真名）。  
- **AuditEvent** — who / what / when / entity id.

写操作经 `src/lib/data/actions.ts`（先校验 Clerk）；读经内存快照 `src/lib/data/store.ts`。

## Agent Operating Rules

- Prefer small, reviewable changes; do not expand scope without asking.  
- Ask the user when product ambiguity blocks progress; do not invent major product policy.  
- If stuck > ~2 minutes of fruitless reasoning on one issue: report and wait.  
- Never commit secrets. Never force-push main. Commit only when asked.  
- Push / PR only when user asks.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Suggested next

1. 配置 `SUPABASE_SERVICE_ROLE_KEY` 并收紧 RLS。  
2. 需要时再开 Lemon Squeezy / 微信登录（见文档）。  
3. 其它产品迭代按用户新指示。

## Open Questions

- 无阻塞项。
