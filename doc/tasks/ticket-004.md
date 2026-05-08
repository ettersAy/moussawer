# Ticket 004: Earnings & Analytics Dashboard Tab

**Status:** todo  
**Priority:** P2  
**Assigned to:** @DevMouss_bot  
**Created:** 2026-05-07  

---

## Description

Add a new "Analytics" tab to the photographer dashboard showing earnings, booking statistics, and performance metrics. Currently the dashboard has zero revenue or analytics features — photographers can see individual bookings but have no way to answer "how much did I earn this month?" or "which service is most popular?"

---

## What to Build

### New Tab: "Analytics" (BarChart3 icon from lucide-react)

Add a 6th tab to the dashboard with:

1. **Earnings Summary Cards** — Total earnings, this month's earnings, pending earnings (from CONFIRMED but not COMPLETED bookings)
2. **Booking Status Breakdown** — Count of PENDING / CONFIRMED / COMPLETED / CANCELLED bookings
3. **Top Services** — List of services ranked by booking count and revenue
4. **Monthly Trend** — Simple month-by-month breakdown of bookings and revenue (last 6 months)

### Data Source
- Use existing `GET /bookings` endpoint (already returns all photographer's bookings)
- Compute stats client-side from the bookings array (status, priceEstimate, startAt, service title)
- No new API endpoint needed — all data is already in the bookings response

### Design
- Use the existing `.dashboard-grid` CSS class for stat cards
- Follow existing panel/card patterns from the dashboard
- Simple number formatting for currency (use existing `money()` helper)

---

## Files to Modify
- `src/pages/photographer/PhotographerDashboard.tsx` — Add `Analytics` tab and component
- `src/styles/` — Any additional CSS for stat cards if needed

---

## Acceptance Criteria
| AC | Description |
|----|-------------|
| AC1 | New "Analytics" tab appears in the dashboard navigation |
| AC2 | Earnings cards show total/month/pending revenue correctly |
| AC3 | Booking status breakdown shows counts for each status |
| AC4 | Top services list is sorted by booking count |
| AC5 | Monthly trend shows last 6 months of data |
| AC6 | All stats are computed client-side from existing bookings data |
| AC7 | `npm run build` and `npm run lint` pass | ✅ |

---

## Implementation Notes

### What Was Done

1. **Analytics tab** — Added 6th tab "Analytics" (BarChart3 icon) to dashboard navigation

2. **Earnings cards** — Three stat cards: Total earnings, This month's earnings, Pending (confirmed) earnings — computed client-side from bookings array

3. **Booking status breakdown** — Counts for PENDING / CONFIRMED / COMPLETED / CANCELLED with StatusBadge display

4. **Top services** — Ranked by booking count, showing revenue per service (top 5)

5. **Monthly trend** — Last 6 months of bookings and revenue in table format

6. **All client-side** — No new API endpoints; all stats computed from existing `GET /bookings` response

### Files Changed
- `src/pages/photographer/PhotographerDashboard.tsx` — Added `AnalyticsPanel` component + tab entry
