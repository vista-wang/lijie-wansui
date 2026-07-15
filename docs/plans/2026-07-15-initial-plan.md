# Universal Rating System — Initial Plan

> Bootstrap plan for product ownership. Detailed task-by-task plans will be added per feature after user confirmation.

**Goal:** A web app where anyone can evaluate arbitrary instances anonymously in public, while every write is real-name audited in the backend.

**Architecture:** Next.js App Router front-end; repository interfaces for Instance / Rating / Audit / User; mock adapters now, Supabase adapters later; Apple-HIG-inspired UI shell.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, local mock auth/storage (Supabase deferred).

---

## 1. Product principles

1. **Universal** — instances are generic subjects (not tied to one vertical in v1).  
2. **Anonymous public surface** — list/detail show scores & comments without reviewer names.  
3. **Accountable writes** — create instance, rate, edit, delete require a signed-in (mock) user and append audit events.  
4. **Swap-ready storage** — UI talks to interfaces only until Supabase is enabled.

## 2. Phased roadmap

### Phase 0 — Bootstrap (this commit)

- Git repository  
- Next.js + TypeScript + Tailwind environment  
- `AGENT.md` / `CLAUDE.md`  
- This plan  
- Mock auth scaffold + placeholder home  

### Phase 1 — Domain & mock data

- Types: `User`, `Instance`, `Rating`, `AuditEvent`  
- In-memory / `localStorage` repositories  
- Seed data for demos  
- Unit-level sanity for repository contracts  

### Phase 2 — Core user flows (HIG UI)

- Home: browse / search instances  
- Instance detail: average score, anonymous reviews, rate CTA  
- Create instance (requires mock login)  
- Lightweight “who am I” switcher for pseudo accounts  

### Phase 3 — Admin / audit

- Authenticated view of real-name audit trail  
- Filter by actor / entity / action  

### Phase 4 — Supabase (explicit go-ahead only)

- Env + clients  
- Schema + RLS (public read of anonymized reviews; hide `author_id` from clients)  
- Replace mock adapters; keep interfaces  

## 3. Suggested data model (draft)

```
users          id, displayName, email, role
instances      id, title, description, category?, createdBy, createdAt
ratings        id, instanceId, score, comment?, authorId, createdAt
audit_events   id, actorId, action, entityType, entityId, payload?, createdAt
```

Public API / UI serializers omit `authorId` on ratings.

## 4. UI direction (Apple HIG)

- System-like navigation bar, large titles where appropriate  
- Primary content first; chrome defers  
- SF-like stack (next: prefer distinctive system-adjacent fonts, not Inter/Roboto defaults)  
- Light appearance default; respect `prefers-color-scheme` carefully  
- Touch targets ≥ 44pt equivalent; clear focus rings  

## 5. Out of scope for v1

- Payments, social graph, rich media uploads  
- Moderation AI, spam scoring  
- Mobile native apps  
- Multi-tenant orgs  

## 6. Decision needed before Phase 1 coding

**Scoring scale & instance taxonomy** — see question to user in session.

---

## Immediate next steps (after user signal)

1. Lock scoring scale + whether categories are free-form or fixed.  
2. Implement Phase 1 types + mock repositories.  
3. Build Phase 2 screens against mock data.  
4. Pause before any Supabase dependency.
