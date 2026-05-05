# CLAUDE.md — Moussawer Photography Marketplace

> **Last mission:** 2026-05-05 · 3 rounds of audit/testing/fixing · See `doc/MISSION_HANDOFF.md` for full context.

## Pre-Flight Checklist (run before any coding)
```bash
# 1. Is the database reachable?
./scripts/db-check.sh

# 2. Is the dev server running?
curl -s http://localhost:4000/api/v1/health || ./scripts/dev-restart.sh

# 3. Can Playwright open a browser?
./scripts/playwright-check.sh

# 4. Are all APIs functional?
./scripts/smoke-test.sh
```

## Tech Stack
- **Backend:** Express 4 + TypeScript + Prisma 6 + PostgreSQL + Zod 3
- **Frontend:** React 19 + Vite 6 + React Router 7 + plain CSS
- **Auth:** JWT (jsonwebtoken + bcryptjs), stored in localStorage
- **Testing:** Vitest 3 + Supertest 7
- **Deployment:** Render.com (free tier), Supabase PostgreSQL (free tier)

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

## Known Issues
- **Supabase free tier pauses after 1 week.** If cloud DB is unreachable, use local Docker PostgreSQL: `docker run -d --name moussawer-pg -e POSTGRES_USER=moussawer -e POSTGRES_PASSWORD=moussawer123 -e POSTGRES_DB=moussawer -p 5432:5432 postgres:14` then set `DATABASE_URL=postgresql://moussawer:moussawer123@localhost:5432/moussawer`
- **Booking timezone gotcha:** API accepts UTC timestamps but validates against photographer's local timezone (default `America/Toronto`). `09:00 UTC = 05:00 Toronto` — outside 9am-5pm availability. Convert times accordingly.
- **pkill -f "tsx watch" kills the shell** on zsh. Use `kill $(lsof -ti:4000) $(lsof -ti:5173)` instead.
- **`status` is a zsh reserved word.** Don't use it as a variable name in shell scripts.
- **Prisma deprecation warning** about `package.json#prisma` is expected — project hasn't migrated to `prisma.config.ts` yet.

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
| Script | Purpose |
|--------|---------|
| `scripts/smoke-test.sh` | Test all 33 API endpoints, report pass/fail |
| `scripts/dev-restart.sh` | Safe kill + restart of both dev servers |
| `scripts/db-check.sh` | DB connectivity test + schema sync check |
| `scripts/playwright-check.sh` | Verify Playwright browser is usable |
| `scripts/schema-check.sh` | Validate schema integrity (relations, indexes) |

## Database
- **20 models:** User, ClientProfile, PhotographerProfile, Category, PhotographerCategory, PhotographerService, AvailabilityRule, CalendarBlock, PortfolioItem, Booking, Conversation, ConversationParticipant, Message, Incident, Dispute, DisputeComment, Review, Favorite, Notification, ActivityLog
- **Tags are comma-separated strings** in PortfolioItem, not a relation — MVP simplification
- **metadata fields use String type** with JSON content — use `safeJson()` from `server/utils/http.ts` when reading
