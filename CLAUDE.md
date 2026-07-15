# CLAUDE.md

This file is the Claude/Cursor agent entrypoint for this repo. Prefer `AGENT.md` for product rules; this file is the short checklist.

## Before coding

1. Read `AGENT.md`.  
2. Read the latest plan under `docs/plans/` if the task is multi-step.  
3. Stay inside `universal-rating/` as the app root.

## Hard constraints

- Product: universal web evaluation system.  
- Public reviews are **anonymous**; backend audit is **real-name**.  
- **No Supabase runtime yet** — mock auth + mock repositories only.  
- UI: Apple Human Interface Guidelines.  
- If blocked or overthinking: stop, report to user, wait.

## Project map

```
universal-rating/
  AGENT.md                 # product + agent rules
  CLAUDE.md                # this checklist
  docs/plans/              # plans & design notes
  src/app/                 # Next.js App Router pages
  src/components/          # UI components
  src/lib/auth/            # mock auth (Supabase later)
  src/lib/data/            # repository interfaces + mock stores
  src/lib/types/           # shared domain types
```

## Do / Don’t

| Do | Don’t |
|----|-------|
| Keep adapters behind interfaces | Call Supabase from components now |
| Match Apple HIG spacing/type | Ship generic purple SaaS chrome |
| Ask before changing product rules | Invent scoring policy unilaterally |
| Small commits when asked | Commit unprompted / commit `.env` |

## Verification

```bash
npm run lint
npm run build
```

Smoke-check `npm run dev` after UI changes.
