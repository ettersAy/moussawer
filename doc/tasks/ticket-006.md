# Ticket 006: Availability Rule Inline Editing

**Status:** todo  
**Priority:** P2  
**Assigned to:** @DevMouss_bot  
**Created:** 2026-05-07  

---

## Description

Add inline editing for existing availability rules. The backend supports `PATCH /me/availability/:id` for updating a rule's day, start time, end time, and active status. But the UI only has add + delete buttons — photographers must delete and re-create a rule just to change a time, losing any historical association.

---

## What to Build

In `PhotographerDashboard.tsx`, in the `AvailabilityManager` component:

1. **Edit button** on each rule row (alongside the existing delete button)
2. **Inline edit form** — When editing, replace the rule's display row with editable fields (day select, start time, end time inputs) plus Save/Cancel buttons
3. **Toggle active/inactive** — Add a toggle to deactivate a rule without deleting it (the `isActive` field on `AvailabilityRule`)

### API endpoints (already exist)
- `PATCH /me/availability/:id` — body: `{ dayOfWeek?, startTime?, endTime?, isActive? }`

### Type update
The `AvailabilityRule` type in the component already has `id`, `dayOfWeek`, `startTime`, `endTime`. No type changes needed.

---

## Files to Modify
- `src/pages/photographer/PhotographerDashboard.tsx` — `AvailabilityManager` component (rule list around line 405-416)

---

## Acceptance Criteria
| AC | Description |
|----|-------------|
| AC1 | Each rule row has an edit button (pencil icon) |
| AC2 | Clicking edit replaces the row with editable day/time inputs |
| AC3 | Save updates the rule via PATCH and refreshes the list |
| AC4 | Cancel reverts to display mode without changes |
| AC5 | Rules can be toggled active/inactive |
| AC6 | `npm run build` and `npm run lint` pass | ✅ |

---

## Implementation Notes

### What Was Done

1. **Edit button** — Pencil icon (Pencil from lucide-react) on each rule row in the Availability tab

2. **Inline edit form** — Clicking edit replaces the rule display row with editable fields (day select, start/end time inputs) plus Save/Cancel buttons, reusing the same form as Add Rule

3. **Toggle active/inactive** — EyeOff button toggles `isActive` via `PATCH /me/availability/:id` without deleting the rule

4. **Rule list display** — Each row shows day name, time range, active/inactive badge, with opacity change for inactive rules

5. **Delete** — Existing delete button preserved with confirmation dialog

### Files Changed
- `src/pages/photographer/PhotographerDashboard.tsx` — `AvailabilityManager` component (rules section)
- `src/lib/api.ts` — Added `AvailabilityRule` type
