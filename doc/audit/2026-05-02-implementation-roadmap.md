# Moussawer — Implementation Roadmap

**Date:** 2026-05-02
**Based on:** Full Application Audit (2026-05-02)

---

## Phase Structure

| Phase | Priority | Focus | Est. Items | Status |
|-------|----------|-------|------------|--------|
| Phase 1 | 🔴 Critical | Photographer Core Features | 4 | ✅ Complete |
| Phase 2 | 🔴 Critical | Admin Governance Features | 2 | ✅ Complete |
| Phase 3 | 🔴 Critical | Client Booking Management | 1 | ✅ Complete |
| Phase 4 | 🟠 High | Cross-cutting UX Foundation | 3 | ✅ Complete (toast, confirm, empty) |
| Phase 5 | 🟠 High | Admin Management Detail | 3 | ⏳ Pending |
| Phase 6 | 🟠 High | Client Core Features | 3 | ⏳ Pending |
| Phase 7 | 🟠 High | Photographer Profile & Dashboard | 2 | ✅ Complete |
| Phase 8 | 🟡 Medium | Backend API Gaps | 3 | ⏳ Pending |
| Phase 9 | 🟡 Medium | Polish & Notifications | 4 | ⏳ Pending |
| Phase 10 | 🟢 Low | Documentation & Testing | 4 | ⏳ Pending |

---

## Phase 1 — Photographer Core Features 🔴

### Objectives
Enable photographers to fully manage their services, portfolio, availability, and bookings through the UI.

### Scope
1. **P2 - Service Management UI**
   - Create ServiceManager component with CRUD operations
   - List photographer's services with toggle active/inactive
   - Create service form (title, description, duration, price, category)
   - Edit service form
   - Delete service with confirmation

2. **P3 - Portfolio Management UI**
   - Create PortfolioManager component
   - Grid display of portfolio items
   - Create portfolio item form (title, description, imageUrl, category, tags, featured)
   - Edit portfolio item
   - Delete with confirmation
   - Reorder capability (set sortOrder)

3. **P4 - Availability Management UI**
   - Create AvailabilityManager component
   - Weekly availability rules CRUD (day, startTime, endTime)
   - Calendar blocks CRUD (startAt, endAt, reason)
   - Visual calendar showing availability

4. **P1 - Booking Management UI**
   - Enhanced booking list with role-specific actions
   - Confirm pending booking
   - Complete confirmed booking
   - Cancel booking with reason
   - Booking detail view

### Dependencies
- Backend APIs already exist for all operations
- No new API endpoints needed for this phase (existing endpoints are sufficient)

### Risks
- Calendar/availability UI complexity is high; start simple and iterate
- Confirmation dialogs needed but not yet built — build inline confirm pattern first

### Required Refactors
- Split `DashboardPage.tsx` into role-specific dashboard components
- Create reusable confirm dialog component (or simple inline confirm)
- Extract form components for reuse

### Testing Requirements
- Login as photographer, verify all CRUD operations
- Test service create/edit/delete flow
- Test portfolio create/edit/delete flow
- Test availability rule add/remove
- Test booking status transitions (confirm, complete, cancel)
- Verify conflict detection still works after changes

### Acceptance Criteria
- Photographer can create, edit, delete, and toggle services
- Photographer can create, edit, delete portfolio items
- Photographer can manage availability rules and calendar blocks
- Photographer can confirm, complete, and cancel bookings
- All actions persist correctly and show success feedback

---

## Phase 2 — Admin Governance Features 🔴

### Objectives
Enable admin to manage bookings across the platform and moderate portfolio content.

### Scope
1. **A1 - Admin Booking Management**
   - Booking list in admin panel with filters (status, photographer, client)
   - Booking detail view
   - Override booking status transitions
   - Audit trail per booking

2. **A2 - Portfolio Moderation**
   - Grid of moderated portfolio items
   - Approve/reject workflow
   - Toggle moderation flag

### Dependencies
- Backend: Add `GET /admin/bookings` endpoint (B5)
- Backend: Ensure portfolio items with `isModerated` are filterable

### Risks
- Admin overrides on bookings should be audited carefully
- Portfolio moderation needs clear UX to avoid accidental approvals

### Required Refactors
- Add admin booking list API endpoint
- Create reusable data table component

### Testing Requirements
- Admin can view all bookings across the platform
- Admin can filter bookings by status
- Admin can moderate portfolio items (approve/reject)
- Admin booking status changes are audit-logged

### Acceptance Criteria
- Admin bookings tab shows all bookings with filtering
- Admin can view booking details and override status
- Admin can approve/reject moderated portfolio items
- All admin actions are logged in activity

---

## Phase 3 — Client Booking Management 🔴

### Objectives
Enable clients to manage their bookings, cancel bookings, and view booking history from the dashboard.

### Scope
1. **C1 - Client Booking Management**
   - Booking list in client dashboard with status filters
   - Cancel pending booking
   - Booking detail view with photographer info, service details, status timeline
   - Write review link on completed bookings

### Dependencies
- None (all APIs exist)

### Risks
- Cancellation should show confirmation dialog
- Cancellation reason should be captured

### Required Refactors
- Extract booking list component for reuse across roles

### Testing Requirements
- Client can view all their bookings
- Client can cancel pending booking with reason
- Client sees "Write Review" CTA on completed bookings
- Cancelled bookings show in list with CANCELLED status

### Acceptance Criteria
- Client dashboard shows comprehensive booking list
- Client can cancel pending bookings with reason
- Completed bookings show review prompt
- Booking detail view shows full timeline

---

## Phase 4 — Cross-cutting UX Foundation 🟠

### Objectives
Establish core UX patterns: toast notifications, confirmation dialogs, and proper empty states across the application.

### Scope
1. **X1 - Toast Notification System**
   - Create Toast context and provider
   - Success, error, warning, info variants
   - Auto-dismiss with configurable duration
   - Stack multiple toasts

2. **X2 - Confirmation Dialog Component**
   - Create ConfirmDialog component
   - Modal with title, message, confirm/cancel buttons
   - Configurable button text and styling
   - Accessible (focus trap, ESC to close)

3. **X3 - Empty State Components**
   - Create EmptyState component with icon, title, description, CTA
   - Apply to all listing pages when no data

### Dependencies
- None (pure frontend components)

### Risks
- Portal-based modals need proper z-index management
- Toast positioning should not overlap header

### Required Refactors
- Wrap app with ToastProvider
- Create shared components directory structure

### Testing Requirements
- Toast appears on success/error actions
- Confirmation dialog prevents accidental destructive actions
- Empty states show meaningful messages and CTAs
- Components are accessible via keyboard

### Acceptance Criteria
- All success/error API calls show toast notification
- All destructive actions require confirmation
- All empty lists show appropriate empty state
- Components are reusable across the app

---

## Phase 5 — Admin Management Detail 🟠

### Objectives
Add detail views and management capabilities for users, incidents, and disputes.

### Scope
1. **A3 - User Management Enhancement**
   - User search/filter by role, status, email
   - User detail modal with profile info, role, status
   - Role change capability (ADMIN ↔ CLIENT ↔ PHOTOGRAPHER)
   - Pagination on user list

2. **A4 - Incident Detail View**
   - Incident detail modal/page
   - Admin notes textarea with save
   - Resolution text with save
   - Status transition buttons
   - Evidence URL display
   - Reporter/target info

3. **A5 - Dispute Detail View**
   - Dispute detail modal/page
   - Admin notes, resolution fields
   - Dispute comments thread
   - Status management
   - Evidence viewing

### Dependencies
- Backend: Add `GET /admin/categories` (B7) for category listing
- Backend: Add `PATCH/DELETE /admin/categories/:id` (B8)

### Risks
- Role changes could lock users out of their profiles
- Admin notes should not be visible to non-admin users

### Required Refactors
- Create reusable modal component
- Create reusable data table with search, filter, pagination

### Testing Requirements
- Admin can search and filter users
- Admin can change user roles and status
- Admin can add notes and resolutions to incidents
- Admin can manage disputes with comments view
- Category CRUD works end-to-end

### Acceptance Criteria
- User management has search, filter, role change
- Incident management has detail view with notes/resolution
- Dispute management has detail view with comments
- Category management has list, edit, delete

---

## Phase 6 — Client Core Features 🟠

### Objectives
Add favorites management, review writing, and case detail visibility for clients.

### Scope
1. **C2 - Favorites Management**
   - Favorites section in dashboard
   - Heart toggle on PhotographerCard (functional)
   - Remove favorite from list
   - Navigate to photographer profile

2. **C3 - Review Writing**
   - Review form on completed bookings
   - Star rating component (1-5)
   - Comment textarea
   - Edit existing review

3. **C4 - Incident/Dispute Detail**
   - Case detail view with status timeline
   - Admin notes visibility (read-only for client)
   - Resolution visibility
   - Dispute comments thread (add/view)

### Dependencies
- None (all APIs exist)

### Risks
- Review editing needs to respect one-review-per-booking rule
- Dispute comments should show author attribution

### Required Refactors
- Create StarRating component
- Add favorites section to dashboard

### Testing Requirements
- Client can add/remove favorites from discovery and profile pages
- Client can write reviews on completed bookings
- Client can view incident/dispute details
- Client can add comments to disputes

### Acceptance Criteria
- Favorites are toggleable from cards and profile
- Favorites list is viewable in dashboard
- Star rating component works with hover and selection
- Reviews are submitted and visible on photographer profile
- Case details show full history and admin responses

---

## Phase 7 — Photographer Profile & Dashboard 🟠

### Objectives
Complete photographer profile management and enhance the photographer dashboard.

### Scope
1. **P5 - Profile Management**
   - Full profile edit form
   - Bio, city, country, starting price, timezone
   - Profile image URL
   - Publish/unpublish toggle
   - Verified badge visibility

2. **P6 - Enhanced Dashboard**
   - Role-specific dashboard for photographers
   - Booking request queue (pending bookings)
   - Revenue summary (price estimates from confirmed/completed bookings)
   - Review summary (rating, count, recent reviews)
   - Quick actions (manage services, portfolio, availability)

### Dependencies
- None (all APIs exist)

### Risks
- Unpublishing hides photographer from discovery — need clear warning
- Starting price changes should be validated

### Required Refactors
- Split DashboardPage into role-specific components
- Create dashboard layout with widget grid

### Testing Requirements
- Photographer can edit all profile fields
- Publish toggle hides/shows photographer in discovery
- Dashboard shows correct role-specific metrics
- Booking queue is accurate

### Acceptance Criteria
- Full profile editing works for all fields
- Publish toggle works (hidden from discovery when unpublished)
- Dashboard shows photographer-specific metrics
- Quick action buttons navigate to correct management sections

---

## Phase 8 — Backend API Gaps 🟡

### Objectives
Fill remaining API gaps identified in the audit.

### Scope
1. **B1 - Password Reset Flow**
   - `POST /auth/forgot-password` — generates reset token
   - `POST /auth/reset-password` — validates token and updates password

2. **B5 - Admin Bookings Endpoint**
   - `GET /admin/bookings` — admin view of all bookings with filtering

3. **B7/B8 - Category Management Endpoints**
   - `GET /admin/categories` — list all categories (admin)
   - `PATCH /admin/categories/:id` — update category name
   - `DELETE /admin/categories/:id` — delete category

### Dependencies
- B5 is needed for Phase 2
- B7/B8 are needed for Phase 5

### Risks
- Category deletion should check for references (services, portfolio, photographers)
- Password reset needs secure token generation

### Required Refactors
- Add email service abstraction (placeholder for now)
- Add reset token field or table to User model (or use JWT-based tokens)

### Testing Requirements
- Password reset flow works end-to-end
- Admin bookings endpoint returns filtered results
- Category CRUD respects referential integrity

### Acceptance Criteria
- Users can reset passwords via email flow
- Admin can manage all bookings through API
- Admin can fully manage categories

---

## Phase 9 — Polish & Notifications 🟡

### Objectives
Add notification center, pagination controls, proper 404 page, and error boundaries.

### Scope
1. **Notification Center**
   - Notification bell in header with unread count
   - Dropdown/list of notifications
   - Mark as read functionality
   - Click-through to related entity

2. **Pagination Controls**
   - Reusable Pagination component
   - Add to Discovery page
   - Add to any list that needs it

3. **404 Not Found Page**
   - NotFoundPage component
   - Friendly message with link to home

4. **Error Boundaries**
   - React error boundary wrapper
   - Fallback UI with retry button

### Dependencies
- None (pure frontend)

### Risks
- Notification polling could increase API load — debounce appropriately
- Error boundary should not catch router errors

### Testing Requirements
- Notification count updates correctly
- Mark-as-read works
- Pagination navigates pages and preserves filters
- 404 page shows for invalid routes
- Error boundary catches and displays errors gracefully

### Acceptance Criteria
- Notification bell shows unread count badge
- Clicking notification marks as read and navigates
- List pages have functional pagination
- Invalid routes show 404 page
- App errors show fallback UI instead of white screen

---

## Phase 10 — Documentation & Testing 🟢

### Objectives
Complete documentation, add E2E test coverage, and final cleanup.

### Scope
1. **Playwright E2E Tests**
   - Guest flow (discovery, profile, support)
   - Client flow (booking, messages, cases, reviews, favorites)
   - Photographer flow (services, portfolio, availability, bookings)
   - Admin flow (users, incidents, disputes, categories, moderation)

2. **API Documentation Updates**
   - Update OpenAPI spec with new endpoints
   - Add request/response examples

3. **Code Cleanup**
   - Remove any debug code
   - Ensure consistent code style
   - Verify all imports are used

4. **README Updates**
   - Updated feature list
   - Updated setup instructions
   - Updated testing instructions

### Dependencies
- All previous phases must be complete

### Testing Requirements
- All E2E tests pass
- No console errors in production build
- Lint passes without warnings

### Acceptance Criteria
- E2E tests cover all major user flows
- Documentation reflects current state
- No dead code or debug artifacts
- README is accurate and helpful
