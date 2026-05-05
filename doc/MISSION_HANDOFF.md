# Mission Handoff — 2026-05-05

> **Read this first** when starting a new session on this project.
> It captures everything discovered, fixed, and learned across 3 audit rounds.

---

## TL;DR — Current State

The app is **fully functional** with zero server errors. All 33 API endpoints + 11 frontend routes work for all 3 roles (Client, Photographer, Admin). Critical security issues have been patched. Dev servers run on `:4000` (API) and `:5173` (Vite).

**One command to verify everything works:**
```bash
./scripts/smoke-test.sh
```

---

## What This Mission Accomplished

### Environment Setup
- **Local PostgreSQL** via Docker (`moussawer-pg` container) because Supabase free tier was paused
- `.env` updated: `DATABASE_URL=postgresql://moussawer:moussawer123@localhost:5432/moussawer`
- Schema pushed + seeded with 5 test users, 6 categories, 3 photographers, bookings, conversations

### Security Fixes (Critical)
| Fix | File |
|-----|------|
| JWT secret fallback removed — throws if `JWT_SECRET` not set | `server/config.ts` |
| Rate limiting added (global 500/15min, auth 10/15min) — dev only | `server/app.ts` |
| Password minimum: 6 → 8 chars | `server/routes/auth.routes.ts` |

### Database Fixes (Critical)
| Fix | File |
|-----|------|
| `DisputeComment.authorId` missing `@relation` to User — added FK + reverse field | `prisma/schema.prisma` |
| 13 missing indexes added on Booking, Message, Notification, PortfolioItem, Incident, Dispute, Review, ActivityLog, DisputeComment | `prisma/schema.prisma` |

### API Fixes (High)
| Fix | File |
|-----|------|
| `JSON.parse` crash risk on activity logs → replaced with `safeJson()` | `server/routes/admin.routes.ts` |
| Pagination added to bookings, conversations, activity endpoints | Multiple routes |
| Request ID middleware for error correlation | `server/app.ts` |
| CORS made configurable via `CORS_ORIGIN` env var | `server/app.ts` |
| `safeJson()` utility exported from `server/utils/http.ts` | `server/utils/http.ts` |

### Timezone Error Message (Medium)
| Fix | File |
|-----|------|
| Booking error now includes photographer's timezone hint: *"Note: times are in UTC — the photographer's timezone is America/Toronto"* | `server/services/availability.ts` |

### Frontend Fixes
| Fix | File |
|-----|------|
| Error boundary wraps entire React app | `src/components/ErrorBoundary.tsx` + `src/main.tsx` |
| 401 auto-redirect: clears expired token, redirects to `/login` (skips public pages) | `src/lib/api.ts` |

### Playwright Browser Fix
- Chrome symlink at `/opt/google/chrome/chrome` was broken (pointed to `/tmp/`)
- Fixed: `pkexec ln -sf ~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome /opt/google/chrome/chrome`
- Verify with: `./scripts/playwright-check.sh`

---

## How to Set Up From Scratch (in a new session)

```bash
# 1. Database — if Supabase is paused, start local PostgreSQL
docker run -d --name moussawer-pg \
  -e POSTGRES_USER=moussawer \
  -e POSTGRES_PASSWORD=moussawer123 \
  -e POSTGRES_DB=moussawer \
  -p 5432:5432 postgres:14

# 2. Configure environment
# Ensure .env has:
#   DATABASE_URL=postgresql://moussawer:moussawer123@localhost:5432/moussawer
#   JWT_SECRET=d6fb73ec361ec5bd4bc60f8375e5f310

# 3. Install + seed
npm install
npx prisma db push
npx prisma generate
npm run db:seed

# 4. Start servers (background with logging)
./scripts/dev-restart.sh

# 5. Verify
./scripts/smoke-test.sh
```

---

## How to Test Everything

### Quick smoke test (API only, ~20 seconds)
```bash
./scripts/smoke-test.sh
# Output: "Results: 26 passed, 0 failed"
```

### Full browser test (all 3 roles)
```js
// In Playwright MCP browser:
// 1. await page.evaluate(() => localStorage.clear());
// 2. Login via API: POST /api/v1/auth/login → set token in localStorage
// 3. Navigate to role-specific pages
// 4. Verify content via page.locator('body').textContent()
```
See `doc/BROWSER_TEST_PATTERNS.md` for reusable code snippets.

### Database check
```bash
./scripts/db-check.sh
# Reports: DB type, connectivity, schema sync, row counts
```

### Schema integrity check
```bash
./scripts/schema-check.sh
# Checks: prisma validate, FK relations, missing indexes, String metadata fields
```

---

## Critical Gotchas (read before writing any code)

### 1. Timezone Trap
Booking API accepts **UTC timestamps** but validates against photographer's **local timezone** (default `America/Toronto`). If a booking returns `SLOT_UNAVAILABLE`, the time is probably outside the photographer's local availability window.

**Example:** `2026-05-20T09:00:00Z` = 5:00 AM Toronto (outside 9am-5pm availability). Use `2026-05-20T13:00:00Z` = 9:00 AM Toronto.

The error message now includes the timezone hint — check it before debugging.

### 2. Shell Safety
- **Never `pkill -f "tsx"`** — kills the shell. Use port-based killing.
- **`status` is reserved** in zsh. Use `code` or `result`.
- **Use `/usr/bin/curl`** not `curl` in scripts.

### 3. Rate Limiting
Rate limiting is **disabled in dev** (`NODE_ENV !== "production"`). If you're getting `RATE_LIMITED` errors in production, the limits are 500 req/15min globally and 10 req/15min for login.

### 4. The `/me` 401 is Normal
The AuthContext always fetches `/me` on page load. Getting a 401 on public pages (home, discovery, support) is expected when no user is logged in. The 401 redirect only triggers when a previously-valid token expires — it skips public paths.

### 5. Prisma Deprecation Warning
`warn The configuration property package.json#prisma is deprecated` — this is expected, the project uses the old config format. Ignore it.

### 6. Playwright MCP Browser
- Chrome binary at: `/opt/google/chrome/chrome` → `chromium-1217`
- If browser fails to launch: run `./scripts/playwright-check.sh`
- If symlink is broken: use the chromium-1217 binary path in `~/.cache/ms-playwright/`
- The MCP server requires this exact path — if it breaks, fix the symlink

---

## Architecture Quick Reference

```
Client Request
  ↓
server/app.ts (Express middleware: helmet, cors, rateLimit, json, morgan)
  ↓
server/routes/*.ts (Zod validation → Prisma query → resource serializer)
  ↓                    ↓                      ↓
  validate()      prisma.find*()        *Resource()
  (http.ts)       (db.ts)              (resources.ts)
  ↓
server/routes/includes.ts (centralized Prisma include objects)
server/routes/helpers.ts  (access checks: assertBookingAccess, etc.)
server/services/          (business logic: availability, notifications)
server/utils/http.ts      (AppError, safeJson, pagination, errorHandler)
```

### Key Patterns
- **All routes** use `asyncHandler` wrapper — never raw async handlers
- **All inputs** validated with Zod via `validate(schema, req.body)`
- **All outputs** serialized through `*Resource()` functions in `resources.ts`
- **Errors** thrown as `new AppError(status, code, message)` — caught by `errorHandler`
- **Auth** via JWT in `Authorization: Bearer <token>` header — checked by `requireAuth` / `requireRole`

### Resource Locations
| What | Where |
|------|-------|
| Route definitions | `server/routes/*.routes.ts` (16 files) |
| Route aggregation | `server/routes/index.ts` |
| Prisma includes | `server/routes/includes.ts` |
| Access checks | `server/routes/helpers.ts` |
| Serializers | `server/services/resources.ts` |
| Business logic | `server/services/availability.ts`, `server/services/notifications.ts` |
| HTTP utilities | `server/utils/http.ts` |
| Prisma schema | `prisma/schema.prisma` |
| Frontend types | `src/lib/api.ts` |
| Auth state | `src/contexts/AuthContext.tsx` |
| Route map | `src/App.tsx` |
| Role guards | `src/components/RequireRole.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/AdminRoute.tsx` |

---

## What Still Needs to Be Done

### Launch Blockers
- [ ] Password reset flow (forgot/reset with email token)
- [ ] Email infrastructure (SendGrid/Nodemailer for transactional emails)
- [ ] File/image upload (Cloudinary or S3)
- [ ] Payment integration (Stripe Connect)

### High-Priority Improvements
- [ ] Real-time messaging via WebSocket (currently polling-based)
- [ ] Access/refresh token pattern (currently single 14-day JWT)
- [ ] Full-text search (currently `LIKE '%q%'` — no index support)
- [ ] N+1 query fix: availability-filtered photographer discovery (line `discovery.routes.ts:82`)
- [ ] Client-side form validation (LoginPage, RegisterPage)
- [ ] Password visibility toggle on forms

### Technical Debt
- [ ] CSP headers are disabled — should be enabled in production
- [ ] Tags stored as comma-separated string — should be relation or JSON array
- [ ] metadata fields use String type — should be PostgreSQL `Json`
- [ ] No structured logging — should use Pino/Winston with request IDs
- [ ] Duplicate query logic in `availability.ts` (`availabilityForDate` vs `assertBookableSlot`)
- [ ] 5 models still missing `@@index` on FK columns: PhotographerCategory, PhotographerService, Conversation, ConversationParticipant, Favorite
- [ ] Hardcoded demo credentials visible on LoginPage — should be env-toggled

### Documentation Gaps
- [ ] No API documentation beyond OpenAPI spec at `/api-docs`
- [ ] No developer onboarding guide
- [ ] No incident response runbook

---

## Files Changed in This Session

### Modified
- `server/config.ts` — JWT secret now required
- `server/app.ts` — rate limiting, CORS config, request ID middleware
- `server/routes/auth.routes.ts` — password min 8
- `server/routes/bookings.routes.ts` — pagination
- `server/routes/messaging.routes.ts` — pagination
- `server/routes/admin.routes.ts` — safeJson, pagination
- `server/utils/http.ts` — added `safeJson()` export
- `server/services/availability.ts` — timezone-aware error message
- `prisma/schema.prisma` — DisputeComment relation, 13 indexes
- `src/lib/api.ts` — 401 auto-redirect (with public page exclusion)
- `src/main.tsx` — ErrorBoundary wrapper
- `.env` — local PostgreSQL URL

### Created
- `CLAUDE.md` — project overview for AI agents
- `src/components/ErrorBoundary.tsx` — React error boundary
- `scripts/smoke-test.sh` — 26-test API smoke suite
- `scripts/dev-restart.sh` — safe server restart
- `scripts/db-check.sh` — database connectivity + diagnostics
- `scripts/playwright-check.sh` — browser availability check
- `scripts/schema-check.sh` — schema integrity validation
- `doc/MISSION_HANDOFF.md` — this file
- `doc/ai-reflection/mission-2026-05-05.md` — what went wrong and what to improve
- `doc/ai-improvement-tasks/done/` — 7 completed improvement tasks
- `AUDIT_REPORT.md` — detailed round 1 audit (33 issues)
- `AUDIT_REPORT_FINAL.md` — final report with roadmap

---

## Session Recovery Checklist

If you're a new AI agent opening this project:

1. Read `CLAUDE.md` first (quick overview)
2. Read this file (what happened, current state)
3. Run `./scripts/db-check.sh` (is the DB up?)
4. Run `curl -s http://localhost:4000/api/v1/health` (is the server up?)
5. Run `./scripts/smoke-test.sh` (do all APIs work?)
6. For browser testing: run `./scripts/playwright-check.sh` first
7. Read `AUDIT_REPORT_FINAL.md` for the full improvement roadmap
8. Check `doc/ai-improvement-tasks/done/` for what was already completed
