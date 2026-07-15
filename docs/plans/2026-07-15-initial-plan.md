# Universal Rating System — Initial Plan

> Bootstrap + locked rules. Detailed task-by-task plans per feature as needed.

**Goal:** A web app where anyone can evaluate arbitrary instances anonymously in public, while every write is real-name audited in the backend.

**Architecture:** Next.js App Router; repository interfaces for Instance / Rating / Comment / Audit / User; mock adapters now, Supabase later; Apple-HIG UI.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, local mock auth/storage (Supabase deferred).

---

## 1. Product principles

1. **Universal** — instances are generic subjects (not tied to one vertical in v1).  
2. **Anonymous public surface** — scores & comments never show reviewer names.  
3. **Accountable writes** — create / rate / comment require signed-in user + audit events.  
4. **Swap-ready storage** — UI talks to interfaces only until Supabase is enabled.

## 2. Locked rules (user, 2026-07-15)

| Rule | Detail |
|------|--------|
| Scoring | Creator picks **one** mode: `scale_10` **or** `binary` |
| Aggregate | `scale_10` → **mean**; `binary` → **majority** (更多人的一方；平局 `tie`) |
| Comments | Separate **anonymous comment** system |
| Account | One real-name identity ↔ one account |
| Per instance | **One** score row (updatable); **one** comment only |

Comments always available regardless of scoring mode.

## 3. Phased roadmap

### Phase 0 — Bootstrap ✅

### Phase 1 — Domain & mock data ✅

- Types aligned with locked rules  
- Repositories enforce unique `(authorId, instanceId)` for rating & comment  
- Seed data for both scoring modes  
- Aggregate: `summarizeScores` (mean / majority)  

### Phase 2 — Core user flows (HIG UI) ✅

- 全中文界面  
- 浏览 / 详情 / 新建 / 评分 / 匿名评论  
- 伪账号切换  
- 敏感词打码（公开展示）  
- 管理员：实名审计 + 敏感词词库  

### Phase 3 — Admin / audit ✅（并入 Phase 2）

### Phase 4 — Supabase (explicit go-ahead only)

## 4. Data model (draft)

```
users          id, displayName, email, role
instances      id, title, description, scoringMode, category?, createdBy, createdAt
ratings        id, instanceId, authorId, score, createdAt, updatedAt
               UNIQUE(authorId, instanceId)
               score: 1..10 if scale_10; 0|1 if binary
comments       id, instanceId, authorId, body, createdAt, updatedAt
               UNIQUE(authorId, instanceId)
audit_events   id, actorId, action, entityType, entityId, payload?, createdAt
```

Public serializers omit `authorId` on ratings and comments.

## 5. UI direction (Apple HIG)

- System-like nav, large titles, deferred chrome  
- System font stack; restrained color (system blue accent)  
- Touch targets ≥ 44pt equivalent; clear focus rings  

## 6. Out of scope for v1

- Payments, social graph, rich media uploads  
- Moderation AI, spam scoring  
- Mobile native apps / multi-tenant orgs  

---

## Immediate next steps

1. ✅ Mode binding A + binary majority locked.  
2. Implement Phase 1 types + mock repositories with uniqueness rules.  
3. Phase 2 screens (after Phase 1).  
4. Pause before Supabase.
