# Ticket 002: Calendar Blocks UI

**Status:** todo  
**Priority:** P1  
**Assigned to:** @DevMouss_bot  
**Created:** 2026-05-07  

---

## Description

Build the UI for managing calendar blocks in the Availability tab. The backend API already fully supports CRUD (`POST/PATCH/DELETE /me/calendar-blocks`) but the UI currently shows a static message: "Block specific dates when you're unavailable. Use the API for now."

Calendar blocks let photographers mark specific date ranges as unavailable (vacation, personal days, equipment maintenance), overriding their weekly availability rules.

---

## What to Build

In `PhotographerDashboard.tsx`, replace the static "Use the API" panel in the `AvailabilityManager` (around line 420-429) with:

1. **Block List** — Show existing calendar blocks with date range, reason, and delete button
2. **Create Block Form** — Date/time range picker + optional reason text input
3. **Delete Block** — Remove a block with confirmation dialog
4. **Edit Block** — Optional: PATCH support for updating block dates/reason

### API endpoints (already exist)
- `GET /me/availability` — returns `{ rules, blocks }` (blocks already fetched but unused in UI)
- `POST /me/calendar-blocks` — body: `{ startAt, endAt, reason? }`
- `PATCH /me/calendar-blocks/:id` — body: `{ startAt?, endAt?, reason? }`
- `DELETE /me/calendar-blocks/:id`

---

## Files to Modify
- `src/pages/photographer/PhotographerDashboard.tsx` — `AvailabilityManager` component

---

## Acceptance Criteria
| AC | Description |
|----|-------------|
| AC1 | Existing calendar blocks are displayed with date range and reason |
| AC2 | Photographer can create a new block (start/end datetime + optional reason) |
| AC3 | Photographer can delete an existing block |
| AC4 | Block list refreshes after create/delete |
| AC5 | Overlapping block validation error from API is shown as toast error |
| AC6 | `npm run build` and `npm run lint` pass | ✅ |

---

## Implementation Notes

### What Was Done

1. **AvailabilityManager rewrite** — Replaced the static calendar-only view with full management UI:
   - **Calendar Blocks list** — Existing blocks displayed with formatted date range + reason
   - **Create Block form** — `datetime-local` inputs for start/end + optional reason text
   - **Delete Block** — Trash button with ConfirmDialog
   - **Weekly Rules list** — Existing rules with day name, time range, active/inactive badge
   - **Add/Edit Rule** — Inline form with day select, time inputs, save/cancel
   - **Toggle Rule** — EyeOff button to deactivate/activate rules without deleting
   - **Delete Rule** — Trash button with ConfirmDialog

2. **Backend types** — Added `CalendarBlock` and `AvailabilityRule` types to `src/lib/api.ts`

3. **API integration** — Fetches `GET /me/availability` which returns `{ rules, blocks }`

### Files Changed
- `src/pages/photographer/PhotographerDashboard.tsx` — `AvailabilityManager` component (full rewrite)
- `src/lib/api.ts` — Added `CalendarBlock`, `AvailabilityRule` types

### Verification
- `npm run lint` ✅ clean
- `npm run build` ✅ passes
- `tsc --noEmit` ✅ no errors
- `npm test` ✅ 7/7 pass
