# Ticket 003: Booking-Messaging Link

**Status:** todo  
**Priority:** P1  
**Assigned to:** @DevMouss_bot  
**Created:** 2026-05-07  

---

## Description

Add a "Message" button to each booking row in the photographer's Booking Manager. When a booking is created, the backend automatically creates a `Conversation` with both the client and photographer as participants (see `bookings.routes.ts:82-100`). But the UI has no way to navigate from a booking to its conversation — photographers must manually go to `/messages` and find the right thread.

---

## What to Build

In `PhotographerDashboard.tsx`, in the `BookingManager` component:

1. **Add "Message" button** to each booking row that links to the conversation
2. The booking object from the API already includes `conversation.id` when using the `bookingInclude`
3. Link should navigate to `/messages` with the conversation ID, or open the conversation directly

### Approach
- Check if `b.conversation` exists on the booking type (booking creation always creates a conversation)
- Add a `MessageCircle` icon button alongside the existing Confirm/Cancel/Complete buttons
- Link to `/messages?conversation=${b.conversation.id}` or use React Router navigation

### Type check
The `Booking` type in `src/lib/api.ts` may need `conversation?: { id: string }` added if not already present.

---

## Files to Modify
- `src/pages/photographer/PhotographerDashboard.tsx` — `BookingManager` component
- `src/lib/api.ts` — Possibly add `conversation` to Booking type

---

## Acceptance Criteria
| AC | Description |
|----|-------------|
| AC1 | Each booking row shows a "Message" button (or icon) |
| AC2 | Clicking navigates to the correct conversation |
| AC3 | Button is visible for all non-cancelled bookings |
| AC4 | `npm run build` and `npm run lint` pass | ✅ |

---

## Implementation Notes

### What Was Done

1. **Backend** — Added `conversations: { select: { id: true } }` to `bookingInclude` in `server/routes/includes.ts` and exposed `conversation` in `bookingResource` (`server/services/resources.ts`)

2. **Frontend type** — Added `conversation?: { id: string }` to `Booking` type in `src/lib/api.ts`

3. **Message button** — Added `MessageCircle` icon button alongside Confirm/Cancel/Complete in `BookingManager`, navigates to `/messages?conversation=<id>`

4. **MessagesPage** — Updated to read `?conversation=` query param via `useSearchParams`, auto-selects the target conversation

5. **Button visibility** — Shown for all non-cancelled bookings that have a conversation

### Files Changed
- `server/routes/includes.ts` — Added conversations to bookingInclude
- `server/services/resources.ts` — Added conversation.id to bookingResource output
- `src/lib/api.ts` — Added conversation field to Booking type
- `src/pages/photographer/PhotographerDashboard.tsx` — Message button in BookingManager
- `src/pages/MessagesPage.tsx` — Query param support for conversation selection
