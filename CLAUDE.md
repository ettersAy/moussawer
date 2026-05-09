# CLAUDE.md — Moussawer Photography Marketplace

> **Last mission:** 2026-05-09 · Migrated from Supabase to Neon PostgreSQL · See `doc/MISSION_HANDOFF.md` for full context.

## Pre-Flight Checklist (run before any coding)
```bash
# 1. Is the database reachable and seeded?
npm run check

# 2. Is the dev server running?
curl -s http://localhost:4000/api/v1/health || ./scripts/dev-restart.sh

# 3. Full verification (typecheck + lint + tests)
npm run verify
```

## Tech Stack
- **Backend:** Express 4 + TypeScript + Prisma 6 + PostgreSQL + Zod 3
- **Frontend:** React 19 + Vite 6 + React Router 7 + plain CSS
- **Auth:** JWT (jsonwebtoken + bcryptjs), stored in localStorage
- **Testing:** Vitest 3 + Supertest 7
- **Deployment:** Render.com (free tier), Neon PostgreSQL (free tier)

## Quick Start
```bash
cp .env.example .env          # Edit DATABASE_URL + JWT_SECRET
npm install
npm run db:push               # Push schema to PostgreSQL
npm run db:seed               # Seed demo data
npm run dev                   # API :4000 + Vite :5173
```

## Architecture
- **Route → Include → Resource pattern:** Routes in `server/routes/*.ts`, Prisma includes in `server/routes/includes.ts`, serializers in `server/services/resources.ts`
- **Shared helpers:** `server/routes/helpers.ts` (access checks, currentUser, uniqueSlug)
- **Auth middleware:** `server/middleware/auth.ts` (optionalAuth, requireAuth, requireRole, signToken)
- **HTTP utils:** `server/utils/http.ts` (AppError, asyncHandler, ok/created/noContent, validate, pagination, safeJson, errorHandler)
- **Services:** `server/services/availability.ts` (slot generation, bookability checks), `server/services/notifications.ts` (in-app notifs + audit logs)

## Key Files
| File | Purpose |
|------|---------|
| `server/app.ts` | Express app setup (middleware, routes, SPA fallback) |
| `server/index.ts` | Server entry (DB connect, listen) |
| `server/config.ts` | Env config (throws if JWT_SECRET missing) |
| `prisma/schema.prisma` | 20 models, 5 enums, 13+ indexes |
| `src/contexts/AuthContext.tsx` | React auth state (login/register/logout) |
| `src/lib/api.ts` | API client, types, token management, 401 auto-redirect |
| `src/App.tsx` | Route definitions with role guards |
| `src/main.tsx` | Root render with ErrorBoundary + providers |

## Critical Warnings
- **Shared database — no separate test DB.** Local dev, tests, and Render production all use the same Neon database. `npm run db:reset` DELETES ALL DATA and re-seeds. Never run it without understanding this. `npm test` does NOT auto-reset anymore (pretest was removed 2026-05-09).
- **After seeding, verify.** Run `npm run db:seed:verify` to confirm users exist. A missing seed is invisible — the app starts fine but login returns 401.
- **Neon requires two env vars.** `DATABASE_URL` (pooled with `pgbouncer=true`) and `DIRECT_URL` (direct, no pooling). Both must be set in local `.env` AND in Render dashboard. Missing `DIRECT_URL` causes silent connection issues.
- **Booking timezone gotcha:** API accepts UTC timestamps but validates against photographer's local timezone (default `America/Toronto`). `09:00 UTC = 05:00 Toronto` — outside 9am-5pm availability.
- **pkill -f "tsx watch" kills the shell** on zsh. Use `kill $(lsof -ti:4000) $(lsof -ti:5173)` instead.
- **`status` is a zsh reserved word.** Use `code`, `result`, or `http_code` in shell scripts.

## Shell Safety Rules (zsh environment)
- **Never use `pkill -f "tsx"` or `pkill -f "vite"`** — kills the shell itself. Use `kill $(lsof -ti:4000) $(lsof -ti:5173)`.
- **Never use `status` as a variable name** — it's a zsh reserved word. Use `code`, `result`, `http_code`.
- **Use `/usr/bin/curl` not bare `curl`** in scripts — PATH may be incomplete in non-interactive shells.
- **Rate limiting is disabled in dev** (only active when `NODE_ENV=production`). If login returns `RATE_LIMITED`, restart the server.

## Test Accounts (seeded)
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | ADMIN |
| client@example.com | password | CLIENT |
| photographer-one@example.com | password | PHOTOGRAPHER |

## Scripts

### npm run
| Script | Purpose |
|--------|---------|
| `npm run verify` | Typecheck + lint + tests — run before committing |
| `npm run check` | DB connectivity + seed check |
| `npm run db:seed:verify` | Confirm seed created >=3 users |
| `npm run db:reset` | **DESTRUCTIVE** — push schema + seed + verify |
| `npm run test:reset` | **DESTRUCTIVE** — reset DB then run tests |
| `npm run dev` | Start API (:4000) + Vite (:5173) |

### Shell scripts
| Script | Purpose |
|--------|---------|
| `scripts/smoke-test.sh` | Test all API endpoints, report pass/fail |
| `scripts/dev-restart.sh` | Safe kill + restart of both dev servers |
| `scripts/db-check.sh` | DB connectivity + schema sync + seed check |
| `scripts/schema-check.sh` | Validate schema integrity (relations, indexes) |

### Logs
| File | Purpose |
|------|---------|
| `mission.log` | Chronological record of mission events — append to it |

## Database
- **Hosting:** Neon PostgreSQL (free tier) — pooled connection for queries, direct connection for migrations
- **20 models:** User, ClientProfile, PhotographerProfile, Category, PhotographerCategory, PhotographerService, AvailabilityRule, CalendarBlock, PortfolioItem, Booking, Conversation, ConversationParticipant, Message, Incident, Dispute, DisputeComment, Review, Favorite, Notification, ActivityLog
- **Tags are comma-separated strings** in PortfolioItem, not a relation — MVP simplification
- **metadata fields use String type** with JSON content — use `safeJson()` from `server/utils/http.ts` when reading
- **Required env vars:** `DATABASE_URL` (pooled, for queries), `DIRECT_URL` (direct, for migrations), `JWT_SECRET` — all three must be set locally and on Render.com
