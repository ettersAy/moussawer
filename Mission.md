# Mission: Build Moussawer From Scratch

You are an autonomous senior full-stack AI coding agent. Your mission is to design and build a complete application from scratch called **Moussawer**.

Moussawer is a professional photography marketplace platform that connects **clients** with **photographers**, while giving **admins** the tools to manage users, bookings, disputes, incidents, communication, moderation, and platform operations.

This project must be designed as a **web app first**, but with a clear architecture that allows a future **Android mobile app** to consume the same backend/API without major rewrites.

You are not forced to use any specific technology stack. Choose the stack you believe is the best fit for building this app fast, cleanly, securely, and maintainably.

You may use Laravel/Vue, Next.js, Nuxt, Django, Rails, NestJS, Symfony, React Native-ready backend, or any other stack you master well.

If you choose a technology at the beginning but later discover that another stack, library, database, architecture, or tooling choice would be clearly better, you have full permission to change direction during development. Do not waste time defending the first choice if switching is the smarter engineering decision. Document the reason briefly and continue.

---

## Core Product Vision

Moussawer is a premium photography service marketplace where:

- Clients discover photographers
- Clients book photographers through real calendar availability
- Photographers manage profiles, portfolios, services, calendars, and bookings
- Everyone can communicate through an internal messaging system
- Incidents and disputes can be reported and managed
- Admins supervise the whole platform
- The backend is API-first and ready for future Android/mobile apps

---

## Architecture Priority

Because an Android app will be added in the future, the architecture must be:

- API-first
- Mobile-ready
- Auth-ready for web and mobile clients
- Versionable, for example `/api/v1`
- Documented with clear request/response contracts
- Built with stable DTOs/resources/serializers
- Not tightly coupled to the web frontend
- Designed so mobile can use the same:
  - Authentication
  - User profiles
  - Photographer search
  - Calendar availability
  - Booking workflow
  - Messaging
  - Notifications
  - Incidents/disputes
  - Reviews
  - Media/portfolio APIs

If the chosen stack supports OpenAPI/Swagger or generated API docs, implement or prepare it.

---

## Main User Roles

### 1. Guest

Guests can:

- Visit the landing page
- Browse/search photographers
- View photographer public profiles
- View public portfolio previews
- Register/login
- Contact platform support

### 2. Client

Clients can:

- Register and manage their profile
- Search/filter photographers
- View photographer profile, portfolio, services, reviews, and calendar availability
- Book an available time slot
- Manage bookings
- Cancel pending bookings
- Send/receive messages
- Report incidents
- Open disputes
- Upload evidence/files for disputes if useful
- Favorite photographers
- Leave reviews after completed bookings
- Receive notifications

### 3. Photographer

Photographers can:

- Register and complete professional profile
- Add bio, location, categories, services, packages, pricing
- Manage portfolio images
- Manage calendar availability
- Block unavailable dates/times
- Accept, reject, cancel, or complete bookings
- Send/receive messages
- Report incidents
- Respond to disputes
- Track simple statistics
- Manage public profile visibility
- Receive notifications

### 4. Admin

Admins can:

- View dashboard statistics
- Manage users
- Manage photographers
- Manage clients
- Manage categories/services
- View all bookings
- Update/cancel bookings if needed
- Moderate portfolio content
- View and moderate messages if required by dispute/security rules
- Manage incidents
- Manage disputes
- Assign dispute status/resolution
- Suspend/disable accounts
- View platform activity/audit logs
- Receive admin notifications

---

## Core Features To Build First

### 1. Authentication & Authorization

Implement:

- Register/login/logout
- Role-based access control
- Protected routes/pages
- Secure password hashing
- Validation
- Authorization checks on every sensitive action
- API authentication usable by both web and future mobile app
- Clean handling of unauthorized/forbidden responses

Preferred test accounts:

```txt
admin@example.com / password
photographer-one@example.com / password
client@example.com / password
````

---

### 2. Public Pages

Build:

* Landing page
* Photographer discovery page
* Photographer public profile page
* Contact/support page
* Login/register pages

The landing page should clearly communicate:

* Find a photographer
* Compare portfolios
* Book real availability
* Chat safely
* Resolve issues through platform support

---

### 3. Photographer Discovery

Users should be able to:

* Search by location
* Filter by category/service
* Filter by price range
* Filter by rating
* Filter by availability
* Sort by rating, price, newest, popularity
* Paginate results

Photographer cards should show:

* Name
* Profile image or placeholder
* Short bio
* Starting price
* Rating
* Main categories
* Availability badge
* CTA to view profile
* CTA to book if applicable

---

### 4. Photographer Profile

Public photographer profile should include:

* Profile hero section
* Bio
* Location
* Services/packages
* Pricing
* Portfolio gallery
* Reviews
* Calendar availability preview
* Booking CTA
* Message CTA if authenticated
* Report profile/content option if useful

---

### 5. Photographer Calendar & Availability

This is a critical feature.

Photographers must be able to:

* Define weekly recurring availability
* Add available time slots
* Block specific dates
* Block vacation/unavailable periods
* View upcoming bookings in calendar/list format
* Prevent double bookings
* Manage timezone correctly

Clients must be able to:

* View photographer availability
* Select an available date/time slot
* Create a booking from that selected slot
* See unavailable dates/times as disabled
* Avoid booking in the past
* Avoid booking already reserved slots

Booking conflict rules:

* Booking an unavailable slot returns a conflict-style error
* Booking an already reserved slot returns a conflict-style error
* Booking a past date returns a validation-style error
* Photographer calendar must update after confirmed/pending booking depending on chosen business logic

Future-friendly ideas:

* Keep design compatible with mobile calendar UI
* Prepare for possible Google Calendar/ICS sync later, but do not overbuild unless easy

---

### 6. Booking System

Booking lifecycle:

```txt
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
completed → terminal
cancelled → terminal
```

Booking should include:

* Client
* Photographer
* Selected service/package
* Date/time start
* Date/time end or duration
* Location
* Notes
* Status
* Price estimate
* Cancellation reason if applicable
* Related messages/incidents/disputes if useful

Rules:

* Client creates booking
* Photographer can confirm/cancel/complete assigned bookings
* Client can cancel pending booking
* Admin can manage all bookings
* Past dates are invalid
* Unavailable photographer/time slot returns conflict-style error
* Invalid status transition returns validation-style error
* Every booking status change should be auditable or at least timestamped

---

### 7. Messaging System

Everyone should be able to send and receive messages with everyone, depending on access rules.

Supported communication:

* Admin ↔ Client
* Admin ↔ Photographer
* Client ↔ Photographer
* Admin ↔ Admin if useful

Messaging should support:

* Conversation/thread list
* Send message
* Receive/read messages
* Message timestamps
* Read/unread state
* Basic notification badge/count
* Link messages to a booking when relevant
* Link messages to an incident/dispute when relevant
* Optional file/image attachments if reasonable
* Admin visibility/moderation rules where appropriate

Important:

* Do not expose private conversations to unrelated users.
* Admin access to messages should be justified for moderation, support, dispute, or safety.
* Design the backend so a future mobile app can reuse messaging APIs.
* Real-time WebSocket messaging is optional for MVP. Polling or refresh-based messaging is acceptable first. Add WebSocket support only if reasonable.

---

### 8. Incident & Dispute Management

Add a structured system for problems that happen before, during, or after a booking.

Incident examples:

* Photographer did not show up
* Client did not show up
* Late arrival
* Wrong location
* Bad behavior
* Payment/pricing disagreement
* Portfolio/content issue
* Booking cancellation problem
* Safety concern
* Other

Dispute examples:

* Client asks for refund
* Photographer contests cancellation
* Service not delivered
* Quality disagreement
* Miscommunication about package/service
* Admin intervention required

Entities/features should include:

* Incident report
* Dispute case
* Reporter user
* Target user if applicable
* Related booking if applicable
* Category/type
* Description
* Evidence/attachments if reasonable
* Status
* Admin notes
* Resolution
* Activity timeline

Suggested statuses:

```txt
incident: open → under_review → resolved → closed
dispute: open → awaiting_response → under_review → resolved → rejected → closed
```

Admin should be able to:

* View all incidents/disputes
* Filter by status/type/user/booking
* Assign/update status
* Add internal notes
* Request more information
* Close/resolution decision
* Notify involved users

Users should be able to:

* Open an incident/dispute
* View their own cases
* Add comments/messages/evidence
* See current status
* Receive notifications

---

### 9. Portfolio System

Photographers can:

* Upload images
* Add title, description, category, tags
* Edit/delete portfolio items
* Mark featured items if useful
* Reorder items if reasonable

Admin can:

* View photographer portfolios
* Delete/moderate inappropriate items
* See reported portfolio content if reporting is implemented

Media storage should be abstracted so it can later move to S3/object storage without major rewrites.

---

### 10. Reviews & Ratings

Add after booking completion if reasonable.

Clients can:

* Review completed bookings
* Rate photographer
* Add text feedback

Photographers/admins:

* Can view reviews
* Admin can moderate reviews if needed

Rules:

* Only clients with completed bookings can review
* One review per completed booking
* Average rating updates photographer discovery/profile

---

### 11. Notifications

Implement a simple notification system or prepare the architecture.

Notify users about:

* New booking request
* Booking confirmed/cancelled/completed
* New message
* New incident/dispute update
* Admin resolution
* Review received

Mobile-ready consideration:

* Store notifications in the database/API
* Make future push notifications possible
* Do not design notifications only as browser-only UI

---

## Dashboards

### Client Dashboard

Show:

* Upcoming bookings
* Recent messages
* Open disputes/incidents
* Favorite photographers
* Booking history shortcut
* Recommended photographers

### Photographer Dashboard

Show:

* Pending bookings
* Upcoming sessions
* Calendar status
* Recent messages
* Open disputes/incidents
* Portfolio completion
* Profile completion
* Simple earnings/statistics placeholder

### Admin Dashboard

Show:

* Total users
* Total photographers
* Total clients
* Total bookings
* Pending bookings
* Open incidents
* Open disputes
* Recent messages/support activity
* Moderation queue
* Recent platform activity

---

## Additional Feature Ideas To Consider

Add these after the MVP is stable, if time allows:

* Saved photographers/favorites
* Featured photographers
* Photographer verification badge
* Profile completion checklist
* Search by map/distance
* Photographer packages/bundles
* Promo codes or discounts
* Payment placeholder architecture
* Refund/cancellation policy fields
* Admin CMS/settings
* User suspension/ban system
* Audit logs
* File attachments for messages/disputes
* Image optimization/thumbnails
* Watermarked portfolio previews
* Dark mode
* Multi-language readiness
* Android-ready API documentation
* PWA-ready frontend if useful

Do not overbuild all of them before the core app works.

---

## UI/UX Direction

Use a minimal, modern, premium visual style.

Design principles:

* Clean spacing
* Soft cards
* Rounded corners
* Subtle shadows
* Professional photography aesthetic
* Mobile-first responsive layout
* Elegant landing page
* Good empty states
* Good loading states
* Clear error/success messages
* Clear calendar UI
* Clear messaging UI
* Clear dispute/incident status badges
* Smooth but subtle micro-interactions

Avoid:

* Generic admin-template look
* Too many colors
* Overcomplicated screens
* Huge components
* Duplicated UI
* Web-only design that will be hard to adapt to mobile

---

## Architecture Requirements

Regardless of chosen stack:

* Keep code modular
* Separate business logic from controllers/routes/pages
* Use validation layer/schema/forms
* Use authorization layer/policies/guards/middleware
* Use resources/serializers/DTOs where useful
* Do not expose sensitive raw database fields
* Keep frontend components small and focused
* Extract API/state logic into services, hooks, composables, stores, or equivalent
* Use reusable UI components
* Use clear folder structure
* Use environment variables
* Add seed/test data
* Add migrations/schema setup
* Add tests
* Add practical documentation

Recommended backend modules/domains:

* Auth
* Users
* Profiles
* Photographer Search
* Portfolio
* Calendar/Availability
* Bookings
* Messaging
* Incidents
* Disputes
* Reviews
* Notifications
* Admin
* Audit/Activity

---

## Data Model Guidance

You are free to design the database, but the app likely needs entities similar to:

* User
* Role/UserRole
* ClientProfile
* PhotographerProfile
* PhotographerService
* PhotographerPackage
* PhotographerAvailability
* AvailabilitySlot
* CalendarBlock
* PortfolioItem
* Booking
* Conversation
* Message
* MessageAttachment
* Incident
* Dispute
* DisputeComment
* EvidenceAttachment
* Review
* Favorite
* Notification
* Category
* ActivityLog/AuditLog

Use migrations or equivalent schema files.

Seed at least:

* One admin
* Several photographers with services
* Several availability slots
* One client
* Portfolio examples/placeholders
* Sample bookings
* Sample messages
* Sample incident/dispute cases

---

## API / Mobile-Ready Requirements

The future Android app must be able to use the same backend.

Therefore:

* Expose all important actions through API endpoints
* Use consistent JSON response format
* Use stable resource shapes
* Use pagination metadata
* Use proper HTTP status codes
* Keep auth mobile-compatible
* Use API versioning if practical
* Avoid frontend-only business logic
* Do not rely on browser sessions only unless the mobile strategy is clear
* Keep file upload APIs compatible with mobile multipart uploads
* Document endpoints for future mobile implementation

Important API areas:

* Auth
* Current user/profile
* Photographer search/profile
* Calendar availability
* Booking creation/status
* Messaging
* Incidents/disputes
* Reviews
* Notifications
* Admin management

---

## Testing Requirements

Add meaningful automated tests for:

* Authentication
* Role access
* Photographer search
* Photographer profile
* Calendar availability
* Booking creation from available slot
* Booking conflict handling
* Booking status transitions
* Booking permissions
* Messaging permissions
* Sending/reading messages
* Incident creation
* Dispute creation/status updates
* Portfolio CRUD
* Review creation rules
* Admin access
* Validation failures

Also include manual testing instructions for:

* Guest flow
* Client flow
* Photographer flow
* Admin flow
* Full booking lifecycle
* Calendar booking flow
* Messaging flow
* Incident/dispute flow

If E2E testing is practical in the chosen stack, add it using Playwright or an equivalent tool.

---

## Development Workflow

Before coding:

1. Inspect the current workspace/repository.
2. Check installed tools, dependencies, MCP servers, package managers, and project state.
3. Decide the best stack for this mission.
4. Create a short implementation plan.
5. Then implement iteratively.

Build in this order:

1. Project foundation
2. Auth and roles
3. Public pages
4. Photographer profiles/search
5. Calendar/availability
6. Booking workflow
7. Messaging
8. Incidents/disputes
9. Portfolio
10. Dashboards
11. Notifications
12. Reviews
13. Admin management
14. Tests
15. Documentation
16. Final polish

Do not stop after creating only scaffolding. Build working flows.

---

## Git Workflow

Use a clean branch:

```bash
git checkout main
git pull origin main
git checkout -b feature/ai/build-moussawer-from-scratch
```

Commit meaningful milestones:

```txt
feat: initialize app foundation
feat: add authentication and roles
feat: add photographer discovery
feat: add calendar availability
feat: add booking workflow
feat: add messaging system
feat: add incidents and disputes
feat: add portfolio management
feat: add dashboards
feat: add notifications and reviews
test: add core feature tests
docs: add setup and manual testing guide
```

At the end:

* Run tests
* Run formatter/linter
* Run production build if applicable
* Commit changes
* Push branch
* Create PR if GitHub tooling is available

---

## Deliverables

At the end, provide:

1. Tech stack chosen and why
2. Why the architecture is ready for future Android/mobile app
3. What was implemented
4. How to run locally
5. Test accounts
6. Commands to run tests
7. Manual testing guide
8. API documentation location
9. Known limitations
10. Recommended next missions
11. Any scripts/automation ideas discovered
12. PR link if created

---

## Important Agent Instructions

* Work autonomously.
* Do not ask questions unless truly blocked.
* Make reasonable product and technical decisions.
* Prefer completing a working version over discussing possibilities.
* If something is too large, build the best MVP first, then improve it.
* If a chosen approach becomes a bad choice, change it.
* Keep code clean and maintainable.
* Do not hardcode secrets.
* Do not ignore security.
* Do not fake test success.
* If tests fail, investigate and fix.
* If some tests cannot be run, explain exactly why.
* Keep documentation practical and short.
* Always think about web + future Android app, not web only.

---

## MCP / Tooling Reflection Section

Important:

* Work with all MCP servers that are installed and relevant to this mission.
* Before starting, inspect the available MCP servers and use them when useful.
* Based on the mission, if you think you need to install an MCP server, you have permission to install it or ask me to install it.
* If you find that one of the tasks would be handled better with an existing MCP server, you have permission to install it or ask me to install it.
* Use filesystem/project MCP tools to inspect files instead of guessing.
* Use database/schema MCP tools when working with the database.
* Use browser/Playwright MCP tools when validating UI flows.
* Use GitHub MCP tools for branches, commits, PRs, and issue tracking if available.
* Use Docker/container MCP tools if the app needs services.
* If an MCP server fails, try to debug or use a reasonable fallback.

Reflection:

At the end of the mission, include a section called **AI Reflection & Automation Ideas** with:

1. MCP servers used and what they helped with.
2. MCP servers that were missing but would have helped.
3. Any repetitive task that should be automated with a Bash script.
4. Any useful future Laravel/Symfony/Django/Rails/Node command that could be created.
5. Any idea for a custom MCP server that would improve future development.
6. Any documentation that should be added for future AI agents.
7. Any technical debt or architectural risk discovered.
8. Recommended next tasks, ordered by priority.
