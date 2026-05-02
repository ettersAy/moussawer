# Audit: Admin "Manage Users" Interface — Gap Analysis & Feature Backlog

> **Date:** 2026-05-02
> **Scope:** `UsersTab.tsx`, `admin.routes.ts` (PATCH /admin/users/:id + GET /admin/users), `AdminPage.tsx` (updateUserStatus)
> **Codebase:** Moussawer — Photography booking platform (React 19 + Express + Prisma/SQLite)

---

## Current State Summary

The current "Manage Users" interface is a **minimal MVP** — it works but lacks depth:

**Frontend (`UsersTab.tsx`):**
- Flat list of all users showing: name, email, role (lowercased), status badge
- One action per user: toggle between `ACTIVE` ↔ `SUSPENDED`
- No search, no filter, no pagination, no sorting
- No detail expansion, no avatar, no creation date visible
- No column headers — just a plain list of rows

**Backend (`admin.routes.ts`):**
- `GET /admin/users` — returns all users ordered by `createdAt desc`, no pagination, no filtering, no search
- `PATCH /admin/users/:id` — accepts `status` (AccountStatus) and/or `role` (Role)
- `userResource` serializer returns: id, email, name, role, status, avatarUrl, clientProfile, photographerProfile, createdAt
- The `StatusBadge` shows ACTIVE/SUSPENDED but the `AccountStatus` enum also includes `DISABLED` – never surfaced in UI

---

## Feature Backlog (Prioritized)

---

### 🔴 P0 — Core User Management (Must Have)

#### [P0-001] Search & Filter Users

**What:** Add search-by-name/email and multi-filter (role × status) to the users list.

**Why:** Current flat list is unusable once there are more than a handful of users. Admin needs to find specific users quickly, filter photographers for verification, find suspended accounts, etc.

**Scope:**
- Search input (debounced) filtering by name or email
- Dropdown filters: by role (ALL / ADMIN / CLIENT / PHOTOGRAPHER) and by status (ALL / ACTIVE / SUSPENDED / DISABLED)
- Backend: Add `search`, `role`, `status` query params to `GET /admin/users`

---

#### [P0-002] Pagination

**What:** Paginate the users list instead of loading all users at once.

**Why:** SQLite + unbounded `findMany()` will cause performance degradation as users grow.

**Scope:**
- Backend: Accept `page`, `imit` query params; return `meta: { page, limit, total, totalPages }` in API envelope
- Frontend: Pagination controls (prev/next, page numbers, page size selector)
- Keep default limit reasonable (e.g. 25 or 50)

---

#### [P0-003] Sortable Columns

**What:** Allow sorting the user list by clicking column headers (name, email, role, status, createdAt).

**Why:** Admin needs to quickly find recently registered users, sort by role, or find accounts by status.

**Scope:**
- Backend: Accept `sortBy` and `sortOrder` query params
- Frontend: Clickable column headers with sort direction indicator

---

#### [P0-004] User Detail Drawer / Expandable Row

**What:** Click a user to see full details without navigating away.

**Why:** Current view is too sparse. Admin needs to see avatar, creation date, client profile info (location, bio, phone), photographer profile info (slug, verification status), and quick stats.

**Scope:**
- Expandable row OR slide-in drawer on user click
- Show: avatar, full name, email, role, status, createdAt, last updated
- Show client profile fields (location, bio, phone) if client
- Show photographer profile fields (slug, verified status, isPublished, city, country, startingPrice, rating) if photographer
- Link to photographer public profile if applicable

---

#### [P0-005] Role Management (Promote/Demote Users)

**What:** Allow admin to change a user's role directly from the user list.

**Why:** Backend PATCH already supports `role` updates, but the UI only exposes status toggling.

**Scope:**
- Role dropdown/selector next to each user (ADMIN / CLIENT / PHOTOGRAPHER)
- Confirmation dialog before changing role (especially before demoting admin)
- Toast feedback on success

---

#### [P0-006] Full AccountStatus Support (DISABLED)

**What:** Surface the `DISABLED` status in the UI alongside ACTIVE and SUSPENDED.

**Why:** The schema has `DISABLED` in `AccountStatus` enum but it's never exposed. Admin needs to be able to permanently disable accounts.

**Scope:**
- Add "Disable" action button (third option alongside Suspend/Activate)
- DISABLED users should have distinct visual treatment (different StatusBadge color)
- Confirm dialog for disabling (irreversible-sounding action)

---

#### [P0-007] User Deletion

**What:** Allow admin to hard-delete or permanently disable a user account.

**Why:** GDPR/privacy compliance and account cleanup.

**Scope:**
- Backend: `DELETE /admin/users/:id` with cascading cleanup or soft-delete
- Frontend: Delete button with confirmation dialog + warning about cascading data loss
- Audit log the deletion

---

### 🟠 P1 — Important (Should Have)

#### [P1-001] Bulk Actions (Select Multiple Users)

**What:** Select multiple users via checkboxes and perform batch operations.

**Why:** Managing large numbers of users one-by-one is tedious. Common ops: bulk suspend spam accounts, bulk verify photographers.

**Scope:**
- Column of checkboxes with "Select All" header toggle
- Bulk action toolbar: "Suspend selected", "Activate selected", "Delete selected"
- Confirmation dialog showing count of affected users

---

#### [P1-002] Photographer Verification Toggle

**What:** Allow admin to verify/unverify photographers from the user list.

**Why:** Photographer verification is a trust signal on the platform. Admin needs a quick way to manage this.

**Scope:**
- Toggle button/icon in each photographer row for `verified` field
- Backend: Add `verified` to PATCH `/admin/users/:id` or create dedicated endpoint
- Visual indicator (badge/icon) showing verified status

---

#### [P1-003] Per-User Statistics

**What:** Show quick stats for each user (or in the detail view): booking count, incidents reported, disputes, messages sent, reviews written.

**Why:** Helps admin assess if a user is problematic (e.g., many incidents/disputes) or valuable (many bookings).

**Scope:**
- Backend: Computed counts included in user response or a dedicated stats endpoint
- Frontend: Small stat pills/numbers in the detail view or expandable row

---

#### [P1-004] Activity History Per User

**What:** Link to or embed activity logs filtered by the selected user.

**Why:** The Activity tab shows all logs. Admin needs to investigate a specific user's actions.

**Scope:**
- Clicking "View activity" on a user filters the Activity tab or opens a mini-timeline in the detail view
- Backend: Add `?actorId=` filter to `GET /admin/activity`

---

#### [P1-005] Export Users to CSV

**What:** Download the current user list (filtered/sorted) as a CSV file.

**Why:** Reporting, data analysis, backup.

**Scope:**
- Export button in the toolbar
- Server-side CSV generation or client-side from loaded data
- Include all visible columns + relevant profile fields

---

#### [P1-006] User Avatar Preview

**What:** Show user avatar in the list (thumbnail) instead of just text.

**Why:** Visual identification helps admin recognize users.

**Scope:**
- Small circular avatar thumbnail in each row
- Fallback to initials if no avatar URL

---

### 🟡 P2 — Nice to Have

#### [P2-001] Column Customization (Show/Hide Columns)

**What:** Let admin choose which columns to display (name, email, role, status, createdAt, bookings, etc.).

**Why:** Different admin workflows need different data visible at a glance.

**Scope:**
- Dropdown menu with toggleable columns
- Persist preference in localStorage

---

#### [P2-002] User Notes (Admin Private Notes)

**What:** Allow admin to attach private notes to a user account.

**Why:** Admin might need to record observations, warnings, or context about a user.

**Scope:**
- Backend: New `AdminNote` model or JSON field on User
- Frontend: Notes section in user detail veiw — add/edit/delete notes
- Notes are only visible to admins

---

#### [P2-003] Email Notification Trigger

**What:** Buttons to trigger specific email notifications: "Send verification email", "Send account notice", "Send password reset link".

**Why:** Admin needs to communicate with users directly through the platform.

**Scope:**
- Backend: Email sending endpoints (or placeholder if email service isn't set up)
- Frontend: Action buttons with confirmation
- Depends on email service integration status

---

#### [P2-004] User Groups / Tags

**What:** Allow admin to tag users with custom labels (e.g., "VIP", "Flagged", "Early adopter") and filter by tags.

**Why:** Organizes users beyond roles for internal workflows.

**Scope:**
- Backend: New `UserTag` model (many-to-many with User)
- Frontend: Tag input in user detail view, tag filter in list

---

#### [P2-005] Impersonation (Login As User)

**What:** Allow admin to temporarily "become" another user to see what they see.

**Why:** Debugging user-reported issues without guessing.

**Scope:**
- Backend: Generate a short-lived JWT for the target user, audit-logged
- Frontend: "Impersonate" button with clear banner indicating impersonation mode
- "Stop impersonating" button to return to admin session
- **Security:** Must be audit-logged and clearly visible to the admin

---

#### [P2-006] Mobile / Responsive Table

**What:** The users list should work well on small screens (cards layout instead of table on mobile).

**Why:** Admin might access the panel from a tablet/phone.

**Scope:**
- Responsive breakpoints that switch from table to card layout
- Maintain all functionality (sort, filter, actions) on mobile

---

#### [P2-007] Audit Export for Compliance

**What:** Export full audit trail for a user (all activity logs, status changes, role changes) as PDF or JSON.

**Why:** Compliance, legal disputes, internal investigations.

**Scope:**
- "Export audit trail" button in user detail view
- Aggregates activity logs + status/role change history

---

## Implementation Notes

### Backend API Changes Required

| Endpoint | Change |
|----------|---------|
| `GET /admin/users` | Add query params: `search`, `role`, `status`, `page`, `limit`, `sortBy`, `sortOrder`. Return `meta` envelope with pagination. |
| `PATCH /admin/users/:id` | Already supports `status` and `role`. Optionally add `verified` for photographer profiles. |
| `DELETE /admin/users/:id` | **New** — hard delete with cascading cleanup or soft-delete via DISABLED status. |
| `GET /admin/users/:id/stats` | **New** — aggregated counts per user. |
| `GET /admin/activity?actorId=` | **New filter** — filter by actor ID. |
| `GET /admin/users/export` | **New** — CSV export endpoint. |

### Data Already Available in `userResource`

The serializer already returns:
- `id`, `email`, `name`, `role`, `status`, `avatarUrl`, `createdAt`
- `clientProfile` → `{ location, bio, phone }`
- `photographerProfile` → `{ id, slug }`

**Missing from serializer (needs adding):**
- `photographerProfile.verified`
- `photographerProfile.isPublished`
- `photographerProfile.city`
- `photographerProfile.country`
- `photographerProfile.startingPrice
- `photographerProfile.rating`

### State Management Notes

- The `AdminPage.tsx` currently loads all users on mount and manages them in a flat `User[]` state
- Moving to paginated/filtered/search will require refactoring this to use query-based loading (useEffect on filter change)
- Consider extracting a `useUsers` hook or delegating state management to the `UsersTab` itself

---

## Summary

| Priority | Features | Count |
|----------|----------|--------|
| 🔴 P0—must have | Search & filter, pagination, sortable columns, user detail show, role management, DISABLED status, user deletion | 7 |
| 🟠 P1 —should have | Bulk actions, photographer verification, per-user stats, activity history per user, CSV export, avatar preview | 6 |
| 🟡 P2 —nice to have | Column customization, admin notes, email triggers, user tags, impersonation, responsive layout, audit export | 7 |
| **Total** | | **20 features** |
