# Refactor: Split Monolithic Files into Modular Components

**Status:** ⏳ Pending
**Priority:** P3 — Medium (code quality, not blocking)
**Project:** `moussawer`
**Estimate:** 3-4 hours

---

## Problem

Three files have grown into monoliths that violate single-responsibility principles and make the codebase harder to maintain, test, and reason about:

| File | Lines | Current State |
|------|-------|---------------|
| `server/routes/index.ts` | ~1,460 | All API routes in one file (auth, discovery, bookings, messaging, incidents, disputes, portfolio, reviews, admin) |
| `src/styles.css` | ~1,300 | All CSS in one file (layout, cards, forms, modals, toasts, admin, responsive breakpoints) |
| `src/pages/AdminPage.tsx` | ~370 | Multiple tabs in one component (overview, users, bookings, incidents, disputes, moderation, categories, activity) |

---

## Goals

1. Each file should have a single clear responsibility
2. Each component/module should fit on one screen (~100-150 lines max)
3. CSS should be co-located with components where possible, or split by domain
4. No duplicate logic or styles
5. Existing functionality must remain unchanged
6. All existing tests must continue to pass

---

## Task 1: Split `server/routes/index.ts`

### Target structure:
```
server/
  routes/
    index.ts           # Router aggregation (~30 lines)
    auth.routes.ts     # /auth/register, /auth/login, /auth/logout, /me
    discovery.routes.ts # /categories, /photographers, /photographers/:id/*
    photographer.routes.ts # /me/photographer, /me/services, /me/availability
    bookings.routes.ts  # /bookings, /bookings/:id/status
    messaging.routes.ts # /conversations, /conversations/:id/*
    cases.routes.ts     # /incidents, /disputes, /admin/incidents/:id, /admin/disputes/:id
    portfolio.routes.ts # /portfolio
    reviews.routes.ts   # /reviews
    favorites.routes.ts # /favorites
    notifications.routes.ts # /notifications
    admin.routes.ts     # /admin/stats, /admin/users, /admin/bookings, /admin/categories, /admin/activity
    support.routes.ts   # /support
    health.routes.ts    # /health
```

### Instructions:
1. Create each route file with only the routes for its domain
2. Export a router from each file
3. `routes/index.ts` should import all routers and mount them on `apiRouter`
4. Move shared helpers (`currentUser`, `requirePhotographerProfile`, `resolvePhotographer`, `assertBookingAccess`, `assertConversationAccess`, `canSeeCase`, `slugify`, `uniqueSlug`) into `server/routes/helpers.ts`
5. Move shared prisma includes (`userInclude`, `bookingInclude`, `photographerInclude`) into `server/routes/includes.ts`
6. Each route file imports only what it needs from helpers, includes, middleware, services, utils

### Acceptance criteria:
- `npm test` passes (all 7 API tests)
- `npm run build` passes
- `npm run lint` passes with 0 errors
- All existing API endpoints respond identically

---

## Task 2: Modularize `src/styles.css`

### Target structure:
```
src/
  styles/
    base.css        # CSS variables, reset, typography, body
    layout.css      # .app-shell, .site-header, .page, .hero
    buttons.css     # .solid-button, .ghost-button, .icon-button, .compact, .full
    forms.css       # label, input, select, textarea, .segmented
    cards.css       # .panel, .photographer-card, .card-image, .card-body, .card-title-row
    tags-badges.css # .tag, .status, .verified, .eyebrow, .rating
    grid.css        # .card-grid, .metrics-grid, .dashboard-grid, .two-column, .portfolio-grid
    profile.css     # .profile-hero, .profile-hero-content, .hero-meta
    booking.css     # .booking-panel, .slot-grid, .slot
    messages.css    # .messages-layout, .thread-list, .bubble, .message-form
    modals.css      # .modal-overlay, .modal-card, .modal-actions
    toasts.css      # .toast-container, .toast, toast variants
    admin.css       # .admin-tabs, .admin-tab, .admin-section
    tabs.css        # .section-tabs, .section-tab
    tables.css      # .table-list, .table-row, .soft-row, .inline-form
    timeline.css    # .booking-timeline, .booking-timeline-item
    responsive.css  # all @media queries
    index.css       # @import all the above files
```

### Instructions:
1. Create `src/styles/` directory
2. Extract each group of related CSS rules into its own file
3. `src/styles/index.css` uses `@import` to include all files (Vite handles @import natively)
4. Update `src/main.tsx` to import `./styles/index.css` instead of `./styles.css`
5. Delete the monolithic `src/styles.css` after verification

### Acceptance criteria:
- All pages render identically (verified via Playwright screenshots)
- No visual regressions at any breakpoint (mobile, tablet, desktop)
- No console errors
- `npm run build` succeeds

---

## Task 3: Split `AdminPage.tsx` into Tab Components

### Target structure:
```
src/pages/admin/
  AdminPage.tsx              # Tab navigation + state management (~80 lines)
  OverviewTab.tsx            # Stats metrics grid (~40 lines)
  UsersTab.tsx               # User list + suspend/activate (~60 lines)
  BookingsTab.tsx            # Booking list + status filter (~80 lines)
  IncidentsTab.tsx           # Incident list + status transitions (~60 lines)
  DisputesTab.tsx            # Dispute list + status transitions (~60 lines)
  ModerationTab.tsx          # Portfolio grid + approve/flag (~60 lines)
  CategoriesTab.tsx          # Category CRUD + list (~90 lines)
  ActivityTab.tsx            # Audit log list (~40 lines)
  Metric.tsx                 # Reusable metric display (~20 lines)
```

### Instructions:
1. Create `src/pages/admin/` directory
2. Extract each tab into its own component file
3. Keep `AdminPage.tsx` as the shell: state management, tab navigation, data loading
4. Pass data and callbacks as props to each tab component
5. `Metric` should be a shared component since it's used in both AdminPage and DashboardPage
6. Each tab component imports only the icons and types it needs

### Acceptance criteria:
- All 8 admin tabs render identically
- No regression in user management, incident management, dispute management
- Playwright smoke test passes
- `npm run build` + `npm run lint` clean

---

## Execution Order

1. **Task 1 first** (server routes) — highest risk, most lines, needs API test validation
2. **Task 3 second** (AdminPage) — medium risk, straightforward extraction
3. **Task 2 last** (CSS) — low risk, purely visual, verify with Playwright snapshots

Commit each task separately to keep the PR reviewable.

---

## Dependencies

- None. All three tasks are independent and can be done in any order.

## Risks

- Route splitting may accidentally change URL matching order. Verify with `npm test`.
- CSS splitting may cause cascade/specificity changes. Verify with Playwright snapshots.
- Tab extraction may break prop drilling. Verify with Playwright smoke test.

## References

- Self-audit doc: `doc/audit/2026-05-02-self-audit.md` (noted over-reading of monolithic files)
- PR #77: feature implementation that pushed these files past maintainable sizes
