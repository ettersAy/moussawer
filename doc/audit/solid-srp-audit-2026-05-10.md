# SOLID / SRP Codebase Audit — 2026-05-10

## Summary

**21 files exceed 200 lines** across the codebase. Of these, **8 are severe SRP violations** that combine multiple unrelated responsibilities. The remaining 13 are moderate — mostly Vue SFCs where the scoped CSS inflates line count, or files that are naturally large but well-structured.

---

## SEVERE — Files Requiring Immediate Refactoring

### 1. `src/pages/photographer/PhotographerDashboard.tsx` — 751 lines

**Problem:** One file contains 7 components managing 6 completely independent domains:

| Component | Lines | Responsibility |
|-----------|-------|---------------|
| `PhotographerDashboard` (shell) | ~62 | Tab routing, data loading |
| `BookingManager` | ~72 | Booking list + status transitions |
| `ServiceManager` | ~100 | Service CRUD + inline forms |
| `PortfolioManager` | ~120 | Portfolio item CRUD + inline forms + image preview |
| `AvailabilityManager` | ~200 | Rules CRUD + Calendar Blocks CRUD + inline forms |
| `AnalyticsPanel` | ~100 | Earnings computation, status counts, service stats, monthly trends |
| `ProfileManager` | ~55 | Profile form |
| `ItemImage` | ~12 | Image with error fallback |

**Proposed structure:**
```
src/pages/photographer/
├── PhotographerDashboard.tsx       (~80 lines — shell with tab routing + data loading)
├── BookingManager.tsx              (~110 lines)
├── ServiceManager.tsx              (~140 lines)
├── PortfolioManager.tsx            (~160 lines)
├── AvailabilityManager.tsx         (~260 lines, or split further into RulesManager + BlocksManager)
├── AnalyticsPanel.tsx              (~120 lines)
├── ProfileManager.tsx              (~80 lines)
└── ItemImage.tsx                   (~30 lines)
```

**SRP violations:**
- BookingManager knows how to transition bookings AND render booking UI
- ServiceManager mixes create/edit form with list display
- PortfolioManager mixes form, image preview, list display
- AvailabilityManager handles BOTH rules and blocks (two distinct domain concepts)
- AnalyticsPanel computes 5 different metrics in one function

---

### 2. `src/pages/admin/UsersTab.tsx` — 577 lines

**Problem:** One file contains: data fetching with debounced search, multi-field sorting, role/status filtering, pagination with ellipsis logic, bulk selection (select all, toggle), bulk actions (activate/suspend/delete), expandable detail rows, confirm dialogs for 4 different actions, inline role change dropdown, and verification toggle.

**Also contains 4 sub-components** that should live in their own files:
- `AvatarThumb` (lines 28-33) — reusable avatar component
- `SortIcon` (lines 122-125) — small but reusable
- `UserRow` (lines 435-521) — complex row with expand, select, actions
- `UserDetail` (lines 523-577) — expandable detail panel

**Proposed structure:**
```
src/pages/admin/
├── UsersTab.tsx                    (~200 lines — data fetching + table shell + pagination)
├── UserRow.tsx                     (~120 lines)
├── UserDetail.tsx                  (~70 lines)
├── users/
│   ├── useUsersFilter.ts           (~50 lines — filter state + debounce)
│   ├── useUsersSelection.ts        (~40 lines — bulk selection logic)
│   └── useUsersActions.ts          (~60 lines — status/role/delete/verify actions)
```

**SRP violations:**
- Filtering, sorting, pagination, selection, and CRUD actions all in one component
- `getActionButtons` computes per-row button configs based on status — view logic mixed with data
- Pagination computation (`pages` useMemo) is complex enough to warrant extraction

---

### 3. `server/routes/photographer.routes.ts` — 421 lines

**Problem:** One router file handles 5 distinct resource groups:

| Resource | Routes | Lines |
|----------|--------|-------|
| Photographer profile | GET/PATCH `/me/photographer` | ~36 |
| Services | GET/POST/PATCH/DELETE `/me/services` | ~90 |
| Availability slot computation | GET `/me/availability/range` | ~60 |
| Availability rules | GET/POST/PATCH/DELETE `/me/availability` | ~140 |
| Calendar blocks | POST/PATCH/DELETE `/me/calendar-blocks` | ~95 |

**Proposed structure:**
```
server/routes/photographer/
├── profile.routes.ts        (~50 lines)
├── services.routes.ts       (~100 lines)
├── availability.routes.ts   (~160 lines)
├── blocks.routes.ts         (~110 lines)
└── index.ts                 (aggregates sub-routers)
```

Maintain the existing flat export from `server/routes/index.ts` so no callers break.

---

### 4. `server/routes/admin.routes.ts` — 373 lines

**Problem:** One router handles 5 admin domains:

| Resource | Routes | Lines |
|----------|--------|-------|
| Stats dashboard | GET `/admin/stats` | ~40 |
| Users CRUD | GET/POST/PATCH/DELETE `/admin/users` | ~210 |
| Categories CRUD | GET/POST/PATCH/DELETE `/admin/categories` | ~70 |
| Bookings list | GET `/admin/bookings` | ~20 |
| Activity log | GET `/admin/activity` | ~20 |

**Proposed structure:**
```
server/routes/admin/
├── stats.routes.ts          (~50 lines)
├── users.routes.ts          (~230 lines)
├── categories.routes.ts     (~80 lines)
├── bookings.routes.ts       (~35 lines)
├── activity.routes.ts       (~35 lines)
└── index.ts                 (aggregates sub-routers)
```

---

### 5. `src/lib/api.ts` — 245 lines

**Problem:** Mixes three unrelated concerns:

| Concern | Lines | Content |
|---------|-------|---------|
| HTTP client | ~80 | `api()`, `ApiError`, token management, fetch wrapper |
| Type definitions | ~140 | 22 TypeScript interfaces (User, Photographer, Booking, Service, etc.) |
| Utilities | ~8 | `money()`, `shortDate()` |

**Proposed structure:**
```
src/lib/
├── api.ts               (~90 lines — client + token + ApiError)
├── types/
│   ├── user.ts           (~30 lines)
│   ├── photographer.ts   (~25 lines)
│   ├── booking.ts        (~25 lines)
│   ├── messaging.ts      (~15 lines)
│   ├── cases.ts          (~15 lines)
│   ├── calendar.ts       (~15 lines)
│   └── index.ts          (re-exports all)
└── utils.ts              (~15 lines — money, shortDate)
```

---

### 6. `prisma/seed.ts` — 377 lines

**Problem:** Data definitions (photographer specs, services, images) are hardcoded inline with the seeding logic.

**Proposed structure:**
```
prisma/
├── seed.ts               (~80 lines — reset + main orchestrator)
├── seed-data/
│   ├── categories.ts
│   ├── users.ts
│   ├── photographers.ts  (the 3 photographer specs arrays)
│   ├── bookings.ts
│   ├── messages.ts
│   ├── incidents.ts
│   └── index.ts
```

---

### 7. `server/services/resources.ts` — 340 lines

**Problem:** All 12 serializers in one file. Each is small and focused, but they bloat the file and create unnecessary coupling. A change to `bookingResource` shouldn't require loading `userResource`, `incidentResource`, etc.

**Proposed structure:**
```
server/services/resources/
├── user.ts
├── photographer.ts
├── service.ts
├── portfolio.ts
├── booking.ts
├── message.ts
├── conversation.ts
├── incident.ts
├── dispute.ts
├── review.ts
├── notification.ts
├── block.ts
├── project.ts
└── index.ts              (barrel re-export)
```

Each file is 15-40 lines and maps 1:1 to a domain model. Existing imports of `{ bookingResource }` from `"../services/resources"` continue working via the barrel.

---

## MODERATE — Files with Inline CSS Bloat (Vue SFCs)

These are structurally acceptable as Vue Single-File Components (template + script + style is the Vue convention), but the scoped CSS inflates them:

| File | Total | CSS | Logic | Assessment |
|------|-------|-----|-------|------------|
| `TaskModal.vue` | 416 | ~255 | ~100 | CSS is 61%. Consider extracting to `TaskModal.css` |
| `SettingsPanel.vue` | 357 | ~150 | ~130 | CSS is 42%. Could extract. |
| `StickyNode.vue` | 544 | ~350 | ~130 | CSS is 64%. Heavy CSS for a single node type. |
| `Toolbar.vue` | 229 | ~130 | ~70 | CSS is 57%. |
| `ProjectModal.vue` | 232 | ~130 | ~70 | CSS is 56%. |
| `ProjectSwitcher.vue` | 267 | ~140 | ~90 | CSS is 52%. |

**Recommendation:** For the three worst (StickyNode, TaskModal, SettingsPanel), extract scoped styles to companion `.css` files using `<style src="./Component.css" scoped>` to keep the SFC pattern while reducing file size.

---

## ACCEPTABLE — Well-Structured but Long

| File | Lines | Why it's OK |
|------|-------|-------------|
| `server/openapi.ts` | 221 | Pure data (OpenAPI spec). No logic. |
| `tests/calendar.spec.ts` | 266 | Test file — long test suites are normal. |
| `src/pages/PhotographerProfilePage.tsx` | 212 | Single page with booking form — one concern. Could extract the booking form. |
| `src/styles/calendar.css` | 588 | Stylesheet — acceptable for a complex calendar component. |
| `src/styles/admin.css` | 538 | Stylesheet — should ideally be split per admin tab. |
| `CanvasView.vue` | 223 | Orchestrator — keyboard handling + theme + auto-save. Could extract keyboard handling. |
| `UserFormModal.tsx` | 291 | Single form — could extract validation to a separate hook. |

---

## Structural Issues (Non-Line-Count)

### A. Server routes are flat

All 16 route files live in `server/routes/` with no subdirectories. The two largest (photographer, admin) should be split into subdirectories as proposed above.

### B. CSS is monolithic

17 stylesheets imported via `index.css`. `calendar.css` (588) and `admin.css` (538) are the worst. Admin CSS could be split per tab (admin-users.css, admin-bookings.css, etc.).

### C. Vue + React cohabitation

Mushajjir (Vue 3 mind-mapping) and Moussawer (React marketplace) share the same codebase with zero shared patterns. This is intentional but worth noting — the Vue stores (Pinia) and React contexts operate independently.

### D. Missing shared UI kit

Buttons, form inputs, badges, and cards are duplicated across components:
- `ghost-button`, `solid-button`, `compact` classes used in every manager component
- Form layouts (`form-row`, `panel`, `content-stack`) repeated inline
- Every manager re-implements the same "list → inline form → confirm dialog" pattern

### E. `server/routes/cases.routes.ts` (215 lines)

Handles BOTH incidents and disputes. These share a pattern but are separate domain concepts. Could split into `incidents.routes.ts` and `disputes.routes.ts`.

---

## Priority Action Plan

| Priority | File | Action | Effort | Risk |
|----------|------|--------|--------|------|
| **P0** | `PhotographerDashboard.tsx` (751) | Split into 7 component files | Medium | Low — pure extraction |
| **P0** | `api.ts` (245) | Split types into `src/lib/types/` | Low | Medium — many imports to update |
| **P1** | `UsersTab.tsx` (577) | Extract sub-components + hooks | Medium | Low |
| **P1** | `photographer.routes.ts` (421) | Split into 4 sub-routers | Medium | Low — maintain barrel export |
| **P1** | `admin.routes.ts` (373) | Split into 5 sub-routers | Medium | Low |
| **P2** | `resources.ts` (340) | Split into per-model files | Low | Low — barrel maintains compatibility |
| **P2** | `seed.ts` (377) | Extract data to `seed-data/` | Low | Low |
| **P3** | Vue SFCs | Extract scoped CSS for top 3 | Low | Low |
| **P3** | `cases.routes.ts` (215) | Split incidents/disputes | Low | Low |

---

## Metrics

- **Total source files analyzed:** ~85 (excluding node_modules, dist, .git)
- **Files ≥ 200 lines:** 21 (24.7%)
- **Severe SRP violations:** 8 files
- **Lines in severe violators:** 3,459 (23.4% of all source lines)
- **Estimated lines saved by proper SRP:** 0 (same functionality), but maintainability improves dramatically
- **Target: 0 files over 300 lines, max 5 files over 200 lines** (tests and data files excepted)
