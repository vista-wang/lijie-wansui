# AGENT.md — 理解万岁

> 使用 Cursor 制作

## Product Goal

Build **理解万岁**, a web-based universal evaluation system: users can discover or create **instances** (subjects of evaluation), then leave **anonymous** public scores and reviews. Every write action is still attributed with the operator’s **real identity** in the backend audit trail.

## Non-Negotiables

1. **Public anonymity / private accountability**  
   - Front-facing scores & reviews must not expose the reviewer’s identity.  
   - Backend audit logs must record who performed create / rate / edit / delete.

2. **Auth & storage**  
   - Target: Supabase Auth + Postgres.  
   - **Current phase: Supabase is disabled.** Use local mock accounts and in-memory / local persistence adapters behind the same interfaces so Supabase can be swapped in later without rewriting UI.

3. **UI**  
   - Follow Apple Human Interface Guidelines: clarity, deference, depth; large readable type; generous spacing; familiar navigation patterns; restrained color; accessible contrast and focus states.

4. **Ownership**  
   - The coding agent owns development and iteration. When blocked or when token cost of further speculation is high, **stop, report, and wait** for the user.

## Current Phase (Bootstrap)

- [x] Repo + Next.js environment  
- [x] AGENT.md / CLAUDE.md  
- [x] Initial plan  
- [x] Domain model & mock data layer  
- [x] Core UI (list / detail / create / rate / comment) — 全中文  
- [x] Admin / audit + 敏感词打码  
- [ ] Supabase integration (later, explicit go-ahead)

## Tech Stack (decided for bootstrap)

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4; Apple-HIG-inspired tokens |
| Auth (now) | Local mock accounts (`src/lib/auth/mock-*`) |
| Auth (later) | Supabase Auth |
| Data (now) | Local mock store behind repository interfaces |
| Data (later) | Supabase Postgres + RLS |
| Package name | `universal-rating` (npm-safe; workspace folder may differ) |
| App root | repository root |

## Locked product rules (2026-07-15)

1. **Scoring modes** — creator picks **one** mode per instance:
   - `scale_10`: score 1–10; instance score = **mean** of all scores  
   - `binary`: 赞成(1) / 反对(0); instance result = **majority side** (more voters wins; tie = `tie`)

2. **Recommendation** — user-affinity collaborative filtering（物以类聚、人以群分）:
   - Find users with similar polar ratings; recommend unrated items they lean toward  
   - Mix “agree-leaning” and “oppose-leaning” candidates (~50%, clamped 35–65%)  
   - Cold start (guest / no polar ratings): global balanced mix  
   - Do **not** show sentiment labels in UI  

3. **One rating per account per instance** — may **update** that single score later; cannot add a second rating row.

4. **Anonymous comments** — separate from scores; public surface never shows author identity.

5. **Per real account, per instance**
   - At most **one** score (updatable).  
   - At most **one** comment (**no second comment**; same row may be edited).  
   - One real-name identity ↔ one system account (1:1).

6. **Audit** — create/update score or comment still recorded with real `authorId` in backend.

## Domain Sketch

- **Instance** — subject + `scoringMode` (`scale_10` | `binary`).  
- **Rating** — one row per `(authorId, instanceId)`; updatable score.  
- **Comment** — one row per `(authorId, instanceId)`; anonymous publicly; no second row.  
- **User** — real-name identity (1:1 with login account).  
- **AuditEvent** — who / what / when / entity id.

Interfaces live under `src/lib/`; UI must not import Supabase clients directly until the integration phase.

## Agent Operating Rules

- Prefer small, reviewable changes; do not expand scope without asking.  
- Do not enable Supabase packages or env wiring until the user says so.  
- Ask the user when product ambiguity blocks progress; do not invent major product policy.  
- If stuck > ~2 minutes of fruitless reasoning on one issue: report and wait.  
- Never commit secrets. Never force-push main. Commit only when asked.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Open Questions

- None blocking Phase 1.
