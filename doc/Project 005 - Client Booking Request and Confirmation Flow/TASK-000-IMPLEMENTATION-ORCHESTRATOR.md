# Implementation Orchestrator — Feature 3: Client Booking Request & Confirmation Flow

> **Purpose**: This file is the entry point for a future AI session to implement all phases of Feature 3.
>
> **Trigger**: When asked to implement Feature 3, navigate to `doc/Project 005 - Client Booking Request and Confirmation Flow/`, read this file, and follow the phase-by-phase instructions below.

---

## How to Use This Document

1. **Start here** at `TASK-000-IMPLEMENTATION-ORCHESTRATOR.md`.
2. Read the entire document first to understand the full scope.
3. Open each task file sequentially by phase — **do not skip phases**.
4. After completing each phase, run the full test suite before moving to the next.
5. Follow the **Workflow Sequence** from `.clinerules` (checkout main → branch → implement → test → pint → commit).

---

## Quick Overview

| Phase | Folder | Tasks | What It Delivers |
|-------|--------|-------|-----------------|
| 01 | `phase-01-database-and-models/` | 2 tasks | `duration_minutes` column + `BookingStatus` enum |
| 02 | `phase-02-backend-api-and-services/` | 2 tasks | `AvailabilityService`, `AvailabilityCheckController`, enhanced `BookingService` + `StoreBookingRequest` |
| 03 | `phase-03-frontend-composables-and-store/` | 2 tasks | `useBookingRequest` composable, rewritten `SchedulePicker` with real-time availability |
| 04 | `phase-04-ui-components-and-view/` | 2 tasks | `PreSubmitSummaryModal`, updated `EventDetailsForm` with duration, wired `BookingRequestView` |
| 05 | `phase-05-testing/` | 2 tasks | Backend feature tests + E2E tests |

**Total**: 5 phases, 10 task files.

---

## Pre-Flight Checklist (Before Starting)

- [ ] Run `git checkout main && git pull origin main` to start from latest.
- [ ] Run `sail up -d` to ensure all services are running.
- [ ] Run `sail artisan test --compact` to confirm all existing tests pass before making changes.
- [ ] Read `doc/ARCHITECTURE.md` for project context.
- [ ] Read `doc/TESTING.md` for testing conventions.
- [ ] Open the existing files mentioned in each task for reference before modifying.

---

## Phase Execution Order

### Phase 1: Database & Models
```
phase-01-database-and-models/
├── task-P1-T01-add-event-duration-to-bookings.md    ← START HERE
└── task-P1-T02-create-booking-status-enum.md
```

**What to do**: Run the migration, create the enum, update model casts and resource. Then run `sail artisan test --compact` before moving on.

### Phase 2: Backend API & Services
```
phase-02-backend-api-and-services/
├── task-P2-T01-create-availability-query-service.md  ← START HERE
└── task-P2-T02-enhance-booking-store-request.md
```

**What to do**: Create `AvailabilityService`, `AvailabilityCheckController`, register routes. Then enhance `BookingService` and `StoreBookingRequest` with cross-field validation. Test with `sail artisan test --compact`.

### Phase 3: Frontend Composables & Store
```
phase-03-frontend-composables-and-store/
├── task-P3-T01-create-useBookingRequest-composable.md  ← START HERE
└── task-P3-T02-enhance-schedulepicker-with-availability.md
```

**What to do**: Create `useBookingRequest.js`, rewrite `SchedulePicker.vue`. Build frontend first (`sail npm run build`) then test.

### Phase 4: UI Components & View
```
phase-04-ui-components-and-view/
├── task-P4-T01-create-booking-summary-modal.md  ← START HERE
└── task-P4-T02-update-event-details-form-with-duration.md
```

**What to do**: Create `PreSubmitSummaryModal.vue`, update `EventDetailsForm.vue`, wire everything in `BookingRequestView.vue`. Build frontend, run tests.

### Phase 5: Testing
```
phase-05-testing/
├── task-P5-T01-backend-feature-tests.md  ← START HERE
└── task-P5-T02-e2e-tests.md
```

**What to do**: Create backend Feature tests for the new endpoints, update E2E tests. Run full suite: `sail artisan test --compact` + `npx playwright test e2e/client/booking-request.spec.js`.

---

## Verification Gates (After Each Phase)

After each phase, run these commands and confirm no failures:

```bash
# Backend tests
sail artisan test --compact

# Code formatting
sail bin pint --dirty --format agent

# Frontend build (if frontend files changed)
sail npm run build
```

## Final Definition of Done

- [ ] All 10 task files implemented.
- [ ] `sail artisan test --compact` passes with no failures.
- [ ] `sail bin pint --dirty --format agent` passes with no warnings.
- [ ] `sail npm run build` compiles without errors.
- [ ] `npx playwright test e2e/client/booking-request.spec.js` passes.
- [ ] Each phase committed with proper `[id]` prefix and descriptive message.
- [ ] PR created against `main` with summary of all changes.

---

> **Note to future self**: Read every task file fully before writing code. Each file contains inline code snippets adapted to the project's exact naming conventions, directory structure, and patterns. Do not use generic templates. When in doubt about a pattern, open sibling files in the same directory for reference.
