# Calendar / Agenda Audit Report

**Date:** 2026-05-07 | **Auditor:** @DevMouss_bot | **Status:** 🔴 NEEDS WORK

---

## EXECUTIVE SUMMARY

The Moussawer platform has backend infrastructure for calendar-aware booking (availability rules, calendar blocks, slot generation, conflict detection), but the **calendar/agenda UX is severely underdeveloped**. There is **zero visual calendar rendering** in the entire frontend, calendar block management has no UI, and critical API endpoints are missing (no DELETE/PATCH for calendar blocks, no date-range queries, no PATCH for availability rules).

---

## 1. WHAT EXISTS — Current State

### 1.1 Database Schema
| Model | Purpose | Fields |
|-------|---------|--------|
| `AvailabilityRule` | Recurring weekly availability | `dayOfWeek` (0-6), `startTime`, `endTime`, `timezone` |
| `CalendarBlock` | One-off time blocks (vacation, etc.) | `startAt`, `endAt`, `reason` |
| `Booking` | Client bookings | `startAt`, `endAt`, `status` |
| `PhotographerProfile` | Photographer settings | `timezone` |

### 1.2 Backend API Endpoints
| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/me/availability` | ✅ | Lists rules + future blocks |
| POST | `/me/availability` | ✅ | Creates availability rule |
| DELETE | `/me/availability/:id` | ✅ | Deletes availability rule |
| POST | `/me/calendar-blocks` | ✅ | Creates calendar block |
| GET | `/photographers/:id/availability?date=` | ✅ | Single-date slot query (public) |
| — | PATCH `/me/availability/:id` | ❌ **MISSING** | Can't update a rule |
| — | DELETE `/me/calendar-blocks/:id` | ❌ **MISSING** | Can't delete a block |
| — | PATCH `/me/calendar-blocks/:id` | ❌ **MISSING** | Can't update a block |
| — | GET `/me/availability/range?from=&to=` | ❌ **MISSING** | Can't get batch availability |

### 1.3 Availability Engine (`server/services/availability.ts`)
- `availabilityForDate()` — Generates time slots for a single date from rules minus blocks minus bookings
- `assertBookableSlot()` — Validates a booking window fits within rules, not blocked, not conflicting
- Both correctly handle: day-of-week matching, time-range overlap detection, past-date blocking

### 1.4 Frontend Components
| Component | What it does | Calendar UI? |
|-----------|-------------|:---:|
| `AvailabilityManager` (PhotographerDashboard) | List/add/delete weekly rules | ❌ Text only |
| Calendar Blocks section | Displays timezone + note: *"Use the API for now: POST /me/calendar-blocks"* | ❌ No UI |
| `PhotographerProfilePage` sidebar | Single-date slot picker (date input + time grid) | ❌ Minimal |
| `DiscoveryPage` filters | `availabilityDate` date input filter | ❌ Just a date input |

**Key finding:** The word "calendar" appears 2 times in the entire frontend codebase — once as a loading message and once in a note telling users to use the API directly. **There is no visual calendar anywhere.**

---

## 2. MISSING FEATURES — Prioritized

### 🔴 CRITICAL — Backend Gaps (Block Launch)
| # | Gap | Impact |
|---|-----|--------|
| 1 | **DELETE `/me/calendar-blocks/:id`** | Photographers can't remove blocks they created — stuck forever |
| 2 | **PATCH `/me/availability/:id`** | Must delete & recreate rules just to change a time |
| 3 | **PATCH `/me/calendar-blocks/:id`** | Can't edit a block reason or time range |
| 4 | **GET `/me/availability/range?from=&to=`** | Can't fetch multi-date availability for calendar UI |

### 🟡 HIGH — Frontend Calendar UI
| # | Gap | Impact |
|---|-----|--------|
| 5 | **No visual calendar component** | Photographers can't see their schedule |
| 6 | **No calendar block CRUD UI** | Must use curl/API to manage blocks |
| 7 | **No booking calendar view** | Bookings shown as flat list, not on a calendar |
| 8 | **No multi-date navigation for clients** | Can only view one date at a time |

### 🟢 MEDIUM — Quality of Life
| # | Gap | Impact |
|---|-----|--------|
| 9 | **No buffer time between bookings** | Back-to-back bookings with no setup/cleanup gap |
| 10 | **No availability rule toggle (enable/disable)** | Must delete and recreate rules to temporarily block a day |
| 11 | **No recurring calendar blocks** | Can't block "every Monday morning" |
| 12 | **No iCal/Google Calendar export** | No calendar sync for photographers |

### 🔵 LOW — Future
| # | Gap |
|---|-----|
| 13 | No booking reminders (email/SMS) |
| 14 | No recurring bookings |
| 15 | No calendar sync (iCal import) |
| 16 | No availability alerts for favorited photographers |

---

## 3. BUGS & ERRORS FOUND

### Bug 1: Calendar block listing has no date filter
**File:** `server/routes/photographer.routes.ts:145`
```ts
const blocks = await prisma.calendarBlock.findMany({
  where: { photographerId: photographer.id, endAt: { gte: new Date() } },
  orderBy: { startAt: "asc" }
});
```
This only returns **future** blocks. If a photographer wants to see past blocks (audit), they can't. Should accept optional `from`/`to` query params.

### Bug 2: No validation that calendar block doesn't overlap existing blocks
**File:** `server/routes/photographer.routes.ts:199-221`
Creating a calendar block doesn't check if it overlaps with an existing block. The booking system checks for conflicts, but blocks can stack on top of each other.

### Bug 3: Availability rule DELETE has no cascade/booking check
Deleting an availability rule doesn't check if there are future confirmed bookings that depend on it. If a photographer deletes their Saturday rule but has a confirmed booking next Saturday, the booking remains but the slot becomes logically invalid.

### Bug 4: `availabilityForDate` doesn't respect `PhotographerProfile.timezone`
The function uses the date string directly (`new Date(\`${date}T12:00:00\`)`) without considering the photographer's timezone. While individual rules have timezone fields, the date boundary is UTC-based, which can cause off-by-one errors near midnight in the photographer's timezone.

### Bug 5: No input sanitization on calendar block `reason` field
The `reason` field is stored as-is with no length limit in the Zod schema. Could accept unlimited text.

---

## 4. IMPROVEMENT PLAN

### Phase 1 — Backend API Completion (THIS SPRINT)
| Task | Est. | Priority |
|------|------|----------|
| T1: Add DELETE `/me/calendar-blocks/:id` | 0.5h | 🔴 |
| T2: Add PATCH `/me/availability/:id` | 1h | 🔴 |
| T3: Add PATCH `/me/calendar-blocks/:id` | 0.5h | 🔴 |
| T4: Add GET `/me/availability/range?from=&to=` | 1h | 🔴 |
| T5: Add `isActive` toggle to AvailabilityRule | 0.5h | 🟡 |
| T6: Add calendar block overlap validation | 0.5h | 🟡 |
| T7: Add `from`/`to` query params to GET `/me/availability` blocks list | 0.5h | 🟢 |

### Phase 2 — Frontend Calendar UI (NEXT SPRINT)
| Task | Est. |
|------|------|
| T8: Build interactive month calendar component | 3h |
| T9: Calendar block CRUD UI (create/edit/delete from calendar) | 2h |
| T10: Booking overlay on calendar (color-coded by status) | 2h |
| T11: Multi-date availability browser for clients | 2h |
| T12: Calendar navigation (prev/next month, today button) | 1h |

### Phase 3 — Advanced Features (FUTURE)
| Task | Est. |
|------|------|
| T13: Buffer time configuration per photographer | 1h |
| T14: Recurring calendar blocks | 2h |
| T15: iCal export endpoint | 2h |
| T16: Booking reminders infrastructure | 3h |

---

## 5. STARTING IMPLEMENTATION — Phase 1

I will now implement Phase 1 tasks (T1-T7) — all backend API completion:

1. **DELETE `/me/calendar-blocks/:id`** — Remove a calendar block
2. **PATCH `/me/availability/:id`** — Update an availability rule in-place
3. **PATCH `/me/calendar-blocks/:id`** — Update a calendar block
4. **GET `/me/availability/range?from=&to=`** — Batch availability query
5. **Add `isActive` field to AvailabilityRule** — Toggle rules without deleting
6. **Calendar block overlap validation** — Prevent overlapping blocks
7. **Date-filtered blocks listing** — Accept `from`/`to` on GET `/me/availability`
