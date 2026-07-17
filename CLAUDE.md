# CLAUDE.md

This file is the Claude/Cursor agent entrypoint for this repo. Prefer `AGENT.md` for product rules; this file is the short checklist.

## Before coding

1. Read `AGENT.md`.  
2. Read the latest plan under `docs/plans/` if the task is multi-step.  
3. App root is the repository root.

## Hard constraints

- Product: universal web evaluation system.  
- Public reviews are **anonymous**; backend audit is **real-name**.  
- **Clerk Auth enabled** — email/password + real name in metadata; content repos may still be mock.  
- UI: Apple Human Interface Guidelines；界面文案仅中文。  
- 敏感词：公开展示打码；管理员维护词库。  
- If blocked or overthinking: stop, report to user, wait.

## Project map

```
.
  AGENT.md                 # product + agent rules
  CLAUDE.md                # this checklist
  docs/plans/              # plans & design notes
  supabase/migrations/     # Postgres schema + RLS
  src/app/                 # Next.js App Router pages
  src/components/          # UI components
  src/lib/auth/            # Clerk helpers + messages
  src/lib/supabase/        # legacy helpers (unused for auth)
  src/lib/data/            # repository interfaces + mock stores
  src/lib/types/           # shared domain types
```

## Do / Don’t

| Do | Don’t |
|----|-------|
| Keep adapters behind interfaces | Call Supabase from random UI without auth layer |
| Match Apple HIG spacing/type | Ship generic purple SaaS chrome |
| Ask before changing product rules | Invent scoring policy unilaterally |
| Small commits when asked | Commit unprompted / commit `.env` |

## Verification

```bash
npm run lint
npm run build
```

Smoke-check `npm run dev` after UI changes.
