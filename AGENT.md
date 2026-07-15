# AGENT.md — Universal Rating System

## Product Goal

Build a **web-based universal evaluation system**: users can discover or create **instances** (subjects of evaluation), then leave **anonymous** public scores and reviews. Every write action is still attributed with the operator’s **real identity** in the backend audit trail.

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
- [ ] Domain model & mock data layer  
- [ ] Core UI (list / detail / create / rate)  
- [ ] Admin / audit view (real-name trail)  
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

## Domain Sketch (provisional)

- **Instance** — evaluable subject (title, description, optional category/tags, createdBy, createdAt).  
- **Rating** — numeric score + optional text; public display is anonymous; `authorId` stored for audit only.  
- **User** — real-name identity for login & audit.  
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

## Open Questions (parked for user)

See `docs/plans/2026-07-15-initial-plan.md` — confirm instance taxonomy and scoring scale before feature build.
